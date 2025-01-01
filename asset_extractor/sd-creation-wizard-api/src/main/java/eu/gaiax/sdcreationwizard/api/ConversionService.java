package eu.gaiax.sdcreationwizard.api;

import eu.gaiax.sdcreationwizard.api.dto.*;
import org.apache.jena.rdf.model.*;
import org.apache.jena.vocabulary.SKOS;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.shacl.vocabulary.SHACL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.topbraid.shacl.engine.Shape;
import org.topbraid.shacl.engine.ShapesGraph;
import org.topbraid.shacl.model.SHPropertyShape;
import org.topbraid.shacl.model.SHShape;
import org.topbraid.shacl.vocabulary.SH;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 'convertToJson' is the primary method called from the controller class. It
 * converts an input multipart shacl file into a json object for the frontend.
 */
@Service
public class ConversionService {
    public static final String SHAPES_DIR = "shapes";
    public static final String PROCESSED_DIR = Paths.get(SHAPES_DIR, "processed").toString();

    private static final Logger logger = LoggerFactory.getLogger(ConversionService.class);

    private ConversionService() {
    }

    /**
     * Accepts a multipart RDF/Turtle file and converts it to a specific JSON file structure
     *
     * @param file a multipart RDF/Turtle file to process
     * @return a processed SHACL model to be serialized to JSON and processed by the frontend later
     * @throws IOException in case of access errors (if the temporary store fails)
     */
    public static ShaclModel convertToJson(MultipartFile file) throws IOException {
        logger.info("Converting uploaded file: {}", file.getOriginalFilename());
        return convertToJson(file.getInputStream());
    }

    public static ShaclModel convertToJson(InputStream inputStream) {

        var model = ModelFactory.createDefaultModel();
        model.read(inputStream, null, Constants.TTL);
        var prefixList = createPrefixList(model);

        var shapes = new ShapesGraph(model).getRootShapes().stream()
                .map(Shape::getShapeResource)
                .map(shape -> constructVicShape(shape, prefixList))
                .collect(Collectors.toList());
        // sort shapes so the deepest shapes are at first and can be handled correctly by the frontend.
        var shapesSorted = shapes.stream()
                .sorted(Comparator.comparingInt(shape -> calculateDepth(shape, shapes, new HashMap<>())))
                .collect(Collectors.toList());

        return new ShaclModel(prefixList, shapesSorted);
    }

    public static ResponseShaclJsonPair checkShaclForJson(final MultipartFile shaclFile, final MultipartFile jsonFile) throws IOException {
        Map<String, String> matchedSubjects = new HashMap<>();

        try(InputStream inputStreamJson = jsonFile.getInputStream();
            InputStream inputStreamShacl = shaclFile.getInputStream()) {
            
            Model modelJson = ModelFactory.createDefaultModel();
            Model modelShacl = ModelFactory.createDefaultModel();
            RDFDataMgr.read(modelShacl, inputStreamShacl, Lang.TTL);
            RDFDataMgr.read(modelJson, inputStreamJson, Lang.JSONLD);

            // Extract paths from SHACL shapes
            Set<String> shaclPaths = new HashSet<>();
            Property shaclPath = modelShacl.createProperty(SHACL.path.getURI());
            StmtIterator it = modelShacl.listStatements((Resource) null, shaclPath, (RDFNode) null);
            while (it.hasNext()) {
                Statement stmt = it.nextStatement();
                shaclPaths.add(stmt.getResource().getURI());
            }

            // Check, if any subject in JSON-LD matches a SHACL path and add matches to a list
            StmtIterator jsonldIt = modelJson.listStatements();
            while (jsonldIt.hasNext()) {
                Statement stmt = jsonldIt.nextStatement();
                Property predicate = stmt.getPredicate();
                if (shaclPaths.contains(predicate.getURI())) {
                    matchedSubjects.put(predicate.getURI(), stmt.getObject().toString());
                }
            }
        }
        return new ResponseShaclJsonPair(convertToJson(shaclFile.getInputStream()), matchedSubjects);
    }

    private static int calculateDepth(VicShape shape, List<VicShape> shapes, Map<VicShape, Integer> visitedShapes) {
        if (visitedShapes.containsKey(shape)) {
            return visitedShapes.get(shape);
        }

        int depth = 0;
        visitedShapes.put(shape, depth);

        for (ShapeProperties property : shape.getConstraints()) {
            String children = property.getChildren();
            if (children != null) {
                VicShape childShape = getShapeByName(children, shapes);
                if (childShape != null) {
                    depth = Math.max(depth, 1 + calculateDepth(childShape, shapes, visitedShapes));
                    visitedShapes.put(shape, Math.max(depth, visitedShapes.get(shape)));
                }
            }
        }

        return depth;
    }

    private static VicShape getShapeByName(String shapeName, List<VicShape> shapes) {
        return shapes.stream().filter(shape -> shape.getSchema().equals(shapeName)).findFirst().orElse(null);
    }

    private static List<ShapeProperties> extractProperties(SHShape shape, List<Map<String, String>> prefixList) {
        var res = new ArrayList<ShapeProperties>();

        for (var propertyShape : shape.getPropertyShapes()) {

            var path = getClassConstraint(propertyShape, prefixList, SH.path);
            Map<String, String> datatype = getDatatype(propertyShape, prefixList);
            datatype = processShNodekind(propertyShape, datatype);

            var validations = new ArrayList<ConstraintOption>();
            for (Property property : new Property[]{SH.minLength, SH.maxLength, SH.minInclusive, SH.maxInclusive, SH.minExclusive, SH.maxExclusive}) {
                var value = readIntProperty(propertyShape, property);
                if (value != null) {
                    validations.add(new ConstraintOption(property.getLocalName(), value));
                }
            }

            var group = getNode(propertyShape, SH.group);
            if (group != null) {
                validations.add(new ConstraintOption(SH.group.getLocalName(), group));
            }

            //readStringProperty(propertyShape, SH.description)
            // reads string property
            Map<String, String> description = readMultiLanguageDescriptionProperty(propertyShape, SH.description);

            res.add(new ShapeProperties(
                    path,
                    readStringProperty(propertyShape, SH.name),
                    datatype,
                    getClassConstraint(propertyShape, prefixList, SH.class_),
                    readIntProperty(propertyShape, SH.minCount),
                    readIntProperty(propertyShape, SH.maxCount),
                    getInProperties(propertyShape, prefixList),
                    readIntProperty(propertyShape, SH.order),
                    validations,
                    getNode(propertyShape, SH.node),
                    description,
                    readStringProperty(propertyShape, SKOS.example),
                    setOrProperties(propertyShape, prefixList)
            ));
        }
        return res;
    }

    private static VicShape constructVicShape(SHShape shape, List<Map<String, String>> prefixList) {
        var properties = extractProperties(shape, prefixList);
        var target = shape.getProperty(SH.targetClass).getObject().asResource();

        return new VicShape(
                properties,
                shape.getLocalName(),
                getPrefixAlias(prefixList, target.getNameSpace()),
                target.getLocalName());
    }

    /**
     * Method to create a list of all prefixes used in the shacl file. Consists of
     * list of Java Map objects each with keys 'url' for the prefix urls and
     * 'alias'.
     */
    private static List<Map<String, String>> createPrefixList(Model model) {

        List<Map<String, String>> prefixList = null;
        if (!model.getNsPrefixMap().isEmpty()) {
            prefixList = new ArrayList<>();
            for (String key : model.getNsPrefixMap().keySet()) {
                Map<String, String> prefix = new HashMap<>();
                prefix.put(Constants.ALIAS, key);
                prefix.put(Constants.URL.toLowerCase(), model.getNsPrefixMap().get(key));
                prefixList.add(prefix);
            }
        }
        return prefixList;
    }

    private static String getPrefixAlias(List<Map<String, String>> prefixList, String url) {

        for (Map<String, String> m : prefixList) {
            if (m.containsValue(url)) {
                return m.get(Constants.ALIAS);
            }
        }
        return null;
    }

    private static List<ShapeProperties> setOrProperties(SHPropertyShape propertyShape, List<Map<String, String>> prefixList) {

        if (!propertyShape.hasProperty(SH.or)) {
            return null; // We explicitly return null so that it is skipped during JSON serialization
        }

        var or = new ArrayList<ShapeProperties>();
        for (RDFNode rdfNode : propertyShape.getProperty(SH.or).getList().asJavaList()) {

            Map<String, String> datatype = getDatatype(rdfNode.asResource(), prefixList);
            ClassConstraint clazz = getClassConstraint(rdfNode.asResource(), prefixList, SH.class_);
            ClassConstraint path = getClassConstraint(rdfNode.asResource(), prefixList, SH.path);
            Integer minCount = readIntProperty(rdfNode.asResource(), SH.minCount);
            Integer maxCount = readIntProperty(rdfNode.asResource(), SH.maxCount);

            or.add(new ShapeProperties(path, null, datatype, clazz, minCount, maxCount));
        }
        return or;
    }

    private static Map<String, String> getDatatype(Resource resource, List<Map<String, String>> prefixList) {

        var res = new HashMap<String, String>();
        if (resource.hasProperty(SH.datatype)) {
            Resource datatype = resource.getProperty(SH.datatype).getResource();
            res.put(Constants.VALUE, datatype.getLocalName());
            res.put(Constants.PREFIX, getPrefixAlias(prefixList, datatype.getNameSpace()));
        }
        return res;
    }

    private static ClassConstraint getClassConstraint(Resource resource, List<Map<String, String>> prefixList, Property property) {
        if (resource.hasProperty(property)) {
            var res = resource.getProperty(property).getResource();
            String prefix = getPrefixAlias(prefixList, res.getNameSpace());
            return new ClassConstraint(prefix, res.getLocalName());
        } else {
            return null;
        }
    }

    private static Statement readProperty(Resource resource, Property property) {

        if (resource.hasProperty(property)) {
            return resource.getProperty(property);
        } else {
            return null;
        }
    }

    private static Statement readProperty(Resource resource, Property property, String language) {
        return resource.getProperty(property, language);
    }

    private static Integer readIntProperty(Resource resource, Property property) {
        var value = readProperty(resource, property);
        if (value != null) {
            return value.getInt();
        } else {
            return null;
        }
    }

    /**
     * Method to create a Map<String, String> for property "description"
     * Only call if resource has multiple descriptions with a language tag.
     */
    private static Map<String, String> readMultiLanguageDescriptionProperty(Resource resource, Property property){

        Map<String, String> string_map = new HashMap<>();
        if (property == SH.description) {
            if (resource.hasProperty(property)) {
                StmtIterator itr = resource.listProperties(property);
                while (itr.hasNext()) {
                    Statement stmt = itr.nextStatement();
                    // string language, language tag e.g ["this is a description", "en"]
                    if(stmt.getObject().toString().indexOf('@') == -1){
                        string_map.put("en", stmt.getString());
                    } else {
                        String[] description_language_list = stmt.getObject().toString().split("@");
                        // list[1] defines language code, list[0] is value
                        string_map.put(description_language_list[1], description_language_list[0]);
                    }
                }
            } else {
                return null;
            }
        }
        else {
            return null;
        }
        return  string_map;
    }

    private static String readStringProperty(Resource resource, Property property) {
        var value = readProperty(resource, property);
        if (value != null) {
            return value.getString();
        } else {
            return null;
        }
    }

    private static String readStringProperty(Resource resource, Property property, String language) {
        var value = readProperty(resource, property, language);
        if (value != null) {
            return value.getString();
        } else {
            return null;
        }
    }

    private static List<ClassConstraint> getInProperties(Resource resource, List<Map<String, String>> prefixList) {

        var res = new ArrayList<ClassConstraint>();

        if (resource.hasProperty(SH.in)) {
            for (var node : resource.getProperty(SH.in).getList().asJavaList()) {
                if (node.isLiteral()) {
                    res.add(new ClassConstraint(null, node.asLiteral().getString()));
                } else if (node.isResource()) {
                    res.add(new ClassConstraint(getPrefixAlias(prefixList, node.asResource().getNameSpace()),
                            node.asResource().getLocalName()));
                }
            }
        }
        return res;
    }

    /**
     * Whenever sh:nodekind sh:IRI is present, set datatype prefix as 'URL'
     */
    private static Map<String, String> processShNodekind(Resource resource, Map<String, String> datatype) {

        if (resource.hasProperty(SH.nodeKind) && SH.IRI.equals(resource.getProperty(SH.nodeKind).getObject())) {
            if (null == datatype)
                datatype = new HashMap<>();
            datatype.put(Constants.PREFIX, Constants.NODE_KIND);
            datatype.put(Constants.VALUE, Constants.IRI);
        }

        return datatype;
    }

    private static String getNode(Resource resource, Property property) {
        var value = readProperty(resource, property);
        if (value != null) {
            return value.getAlt().getLocalName();
        } else {
            return null;
        }
    }
}
