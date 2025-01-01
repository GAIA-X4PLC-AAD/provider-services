package eu.gaiax.sdcreationwizard.api;

import com.fasterxml.jackson.databind.ObjectMapper;

import eu.gaiax.sdcreationwizard.api.dto.ResponseShaclJsonPair;
import eu.gaiax.sdcreationwizard.api.dto.ShaclFileUtils;
import eu.gaiax.sdcreationwizard.api.dto.ShaclModel;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOCase;
import org.apache.commons.io.filefilter.FileFilterUtils;
import org.apache.commons.io.filefilter.TrueFileFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.IntStream;

import static java.util.stream.Collectors.groupingBy;

/**
 * Main entry point for REST calls. Provides access to pre-defined files as well as a Turtle to JSON preprocessor for the frontend.
 */
@RestController
public class ConversionController {
    private static final Logger logger = LoggerFactory.getLogger(ConversionController.class);
    private static final File PROCESSED_DIR = new File(ConversionService.PROCESSED_DIR);
    private static final Map<String, Map<String, List<String>>> ecosystemToCategoryToShaclFileMap = createEcosystemToShaclFileMap();

    static {
        boolean processedExists = !PROCESSED_DIR.mkdirs();
        ecosystemToCategoryToShaclFileMap.keySet().forEach(ConversionController::createEcosystemDirInProcessedDir);

        logger.info("Cache dir: {}", PROCESSED_DIR.getPath());

        Collection<File> shaclFilesInProcessedDir = FileUtils.listFiles(
                PROCESSED_DIR, new String[] { Constants.JSON.toLowerCase() }, true);

        if (processedExists && !shaclFilesInProcessedDir.isEmpty()) {
            int cachedFiles = shaclFilesInProcessedDir.size();
            shaclFilesInProcessedDir.forEach(FileUtils::deleteQuietly);

            int fails = 0;
            for (File file : shaclFilesInProcessedDir) {
                if (file.exists()) {
                    fails++;
                }
            }

            int successes = cachedFiles - fails;
            logger.info("Removed {} cached files, failed to remove {} cached files from {}.", successes, fails, PROCESSED_DIR);
        } else {
            logger.info("No cached files to clean.");
        }

        long count = ecosystemToCategoryToShaclFileMap.values().stream().mapToInt(
                        stringListMap -> stringListMap.values().stream().flatMapToInt(
                                files -> IntStream.of(files.size())).sum()).sum();
        logger.info("Found up to {} SHACL files to process.", count);

        ecosystemToCategoryToShaclFileMap.forEach((ecosystem, categories) -> categories.forEach((category, files) -> files.forEach(
                file -> convertTurtleFileToJson(ecosystem, category, file))));
    }

    private static Map<String, Map<String, List<String>>> createEcosystemToShaclFileMap() {

        Collection<File> files = FileUtils.listFiles(new File(ConversionService.SHAPES_DIR),
                FileFilterUtils.suffixFileFilter(Constants.TTL, IOCase.INSENSITIVE), TrueFileFilter.INSTANCE);

        Map<String, Map<String, List<File>>> filesToCategoryAndEcosystemMap = files.stream().collect(
                groupingBy(file -> file.getParentFile().getParentFile().getName(), groupingBy(
                        file -> file.getParentFile().getName())));

        Map<String, Map<String, List<String>>> ecosystemToShaclFileMap = new HashMap<>();

        filesToCategoryAndEcosystemMap.forEach((ecosystem, categoryMap) -> {
            Map<String, List<String>> filesToCategory = new HashMap<>();
            categoryMap.forEach((c, shaclFiles) -> {
                List<String> filenames = new ArrayList<>();
                shaclFiles.forEach(f -> filenames.add(f.getName()));
                filesToCategory.put(c, filenames);
            });

            ecosystemToShaclFileMap.put(ecosystem, filesToCategory);
        });

        return ecosystemToShaclFileMap;
    }

    private static void convertTurtleFileToJson(String ecosystem, String category, String filename) {

        logger.info("Converting file: {}", filename);

        // Convert SHACL to JSONS
        ShaclModel shaclModel;
        try {
            shaclModel = ConversionService.convertToJson(new FileInputStream(
                    ConversionService.SHAPES_DIR + File.separator +
                            ecosystem + File.separator + category + File.separator + filename
            ));
        } catch (FileNotFoundException e) {
            throw new IllegalStateException(e);
        }

        String jsonFilename = ShaclFileUtils.getJsonFilename(filename);
        // Save to file as cache
        logger.debug("Saving file to JSON: {}", jsonFilename);
        File shaclFileInProcessedDir = new File(PROCESSED_DIR.toPath().resolve(ecosystem).toString(), jsonFilename);

        try {
            new ObjectMapper().writeValue(shaclFileInProcessedDir, shaclModel);
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    private static void createEcosystemDirInProcessedDir(String ecosystem) throws IllegalStateException {
        File ecosystemInProcessedDir = new File(PROCESSED_DIR, ecosystem);

        if (!ecosystemInProcessedDir.exists()) {
            boolean isDirCreated = ecosystemInProcessedDir.mkdirs();

            if (!isDirCreated) {
                String errorMessage = String.format("Couldn't create subdirectory %s in directory %s",
                        ecosystem, PROCESSED_DIR.getName());
                throw new IllegalStateException(errorMessage);
            }
        }
    }

    /**
     * Returns all available predefined SHACL files. All *.json files same directory will be considered.
     *
     * @return a map of file names of all available SHACL files
     */
    @GetMapping(value = "/getAvailableShapes")
    @CrossOrigin(origins = "*")
    public Map<String, Map<String, List<String>>> getAvailableShapes() {

        Map<String, Map<String, List<String>>> availableShapes = new HashMap<>();

        ecosystemToCategoryToShaclFileMap.forEach((ecosystem, categories) -> {
            Map<String, List<String>> categoryWithJsonFilenames = new HashMap<>();
            categories.forEach((category, files) -> {
                List<String> jsonFilename = new ArrayList<>();
                files.forEach(file -> jsonFilename.add(ShaclFileUtils.getJsonFilename(file)));
                categoryWithJsonFilenames.put(category, jsonFilename);
            });
            availableShapes.put(ecosystem, categoryWithJsonFilenames);
        });

        return availableShapes;
    }

    /**
     * Converts a given SHACL file to a specific JSON representation
     *
     * @param shaclFile a multipart SHACL file with *.ttl extension
     * @return a JSON serialization of the processed content to be used in VIC
     */
    @PostMapping(value = "/convertFile", produces = "application/json")
    @CrossOrigin(origins = "*")
    public ResponseEntity<Object> convertShacl(@RequestParam("file") MultipartFile shaclFile) {
        logger.info("Converting SHACL file: {}", shaclFile.getOriginalFilename());
        ShaclModel shaclModel;
        try {
            shaclModel = ConversionService.convertToJson(shaclFile);
        } catch (IOException e) {
            return new ResponseEntity<>("Shacl conversion failed <-> Bad Input", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(shaclModel, shaclModel.getPrefixList().isEmpty() && shaclModel.getShapes().isEmpty()
                ? HttpStatus.BAD_REQUEST : HttpStatus.OK);
    }

    /**
     * Converts a given SHACL file in conjunction with a json file to a JSON object (ResponseShaclJsonPair) including
     * Shacl Model and a Map of Subjects and their values, which are present in both files
     *
     * @param shaclFile a multipart SHACL file with *.ttl extension
     * @param jsonFile a multipart json file with *.json extension
     * @return a JSON serialization of the processed content
     */
    @PostMapping(value = "/convertAndPrefillFile", produces = "application/json")
    @CrossOrigin(origins = "*")
    public ResponseEntity<Object> convertShaclAndJson(@RequestParam("file") MultipartFile shaclFile, @RequestParam("jsonFile") MultipartFile jsonFile) {
        logger.info("Converting JSON and SHACL file: {}, {}", jsonFile.getOriginalFilename(), shaclFile.getOriginalFilename());
        ResponseShaclJsonPair response;
        try {
            response = ConversionService.checkShaclForJson(shaclFile, jsonFile);
        } catch (IOException e) {
            return new ResponseEntity<>("Shacl conversion failed <-> Bad Input", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    /**
     * To be used after /getAvailableShapes. Returns the content of a predefined JSON file.
     *
     * @param ecosystem the ecosystem of the searched file.
     * @param name the file name to return. Can be chosen from /getAvailableShapes response.
     * @return the full content of the respective JSON file.
     */
    @GetMapping(value = "/getJSON")
    @CrossOrigin(origins = "*")
    public ResponseEntity<String> getJSON(String ecosystem, String name) throws IllegalArgumentException {
        if (ecosystem == null || name == null) {
            return new ResponseEntity<>("Input name or ecosystem no specified", HttpStatus.BAD_REQUEST);
        }

        String s;
        try {
            Path pathToFile = PROCESSED_DIR.toPath().resolve(ecosystem).resolve(name).normalize();

            // prevent path traversal
            if (!pathToFile.startsWith(PROCESSED_DIR.toPath())) {
                throw new IllegalArgumentException("Potential path traversal attack");
            }

            s = Files.readString(pathToFile);
        } catch (IOException | NullPointerException e) {
            return new ResponseEntity<>("File not found", HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(s, HttpStatus.OK);
    }

    /**
     * Get all the shapes of one specific ecosystem.
     *
     * @param ecosystem shacl files will be categorized by category of ecosystem.
     * @return a map of file names of all available SHACL files for specific ecosystem.
     */
    @GetMapping(value = "/getAvailableShapesCategorized")
    @CrossOrigin(origins = "*")
    public ResponseEntity<Map<String, List<String>>> getAvailableShapesCategorized(String ecosystem) {

        Map<String, List<String>> availableShapes = new HashMap<>();
        if (ecosystemToCategoryToShaclFileMap.containsKey(ecosystem)) {

            ecosystemToCategoryToShaclFileMap.get(ecosystem).forEach((category, files) -> {
                    List<String> jsonFilenames = new ArrayList<>();
                    files.forEach(file -> jsonFilenames.add(ShaclFileUtils.getJsonFilename(file)));
                    availableShapes.put(category, jsonFilenames);
            });

            return new ResponseEntity<>(availableShapes, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // Todo
    @GetMapping(path = "/getSearchQuery/{ecoSystem}/{query}")
    // http://localhost:8080/api/v1/mno/objectKey/1/Saif
    @CrossOrigin(origins = "*")
    public ResponseEntity<Map<String, List<String>>> getSearchQuery(@PathVariable String ecoSystem, @PathVariable String query) {

        if (ecosystemToCategoryToShaclFileMap.containsKey(ecoSystem)) {

            Map<String, List<String>> eco_system = (ecosystemToCategoryToShaclFileMap.get(ecoSystem));
            Map<String, List<String>> selection = new HashMap<>();

            System.out.println(eco_system.keySet());
            for (String key : eco_system.keySet()) {
                List<String> list = eco_system.get(key);
                System.out.println(list);
                for (String itm : list) {
                    if (itm.toLowerCase().contains(query.toLowerCase())) {

                        List<String> l_tmp = selection.get(key);
                        if (!selection.containsKey(key)) {
                            selection.put(key, new ArrayList<>());
                        }

                        //selection.get(key).add()

                        System.out.println(itm);
                    }

                }

            }

            return new ResponseEntity<>(selection, HttpStatus.OK);

        } else {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}