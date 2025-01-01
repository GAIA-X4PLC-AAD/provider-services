package eu.gaiax.sdcreationwizard.api.dto;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.text.WordUtils;

public class ShaclFileUtils {

    public static final String JSON_FILE_ENDING = ".json";
    public static final String TTL_FILE_ENDING = ".ttl";

    private ShaclFileUtils() {
        throw new IllegalStateException("Utility class");
    }

    public static String getJsonFilename(String file)  {

        // Capitalise each word and remove dash
        String name = WordUtils
                .capitalizeFully(file, '-')
                .replace("-", " ");

        // Replace file ending and remove word shape
        String removedFileEnding = StringUtils.removeEndIgnoreCase(name, TTL_FILE_ENDING);
        String removedShapeEnding = StringUtils.removeEndIgnoreCase(removedFileEnding, "shape");

        return removedShapeEnding + JSON_FILE_ENDING;
    }
}
