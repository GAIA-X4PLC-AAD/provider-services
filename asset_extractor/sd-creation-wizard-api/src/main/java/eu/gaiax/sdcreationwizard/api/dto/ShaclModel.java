package eu.gaiax.sdcreationwizard.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.Map;

/**
 * Return object that has the entire shape graph with all properties including prefix info
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ShaclModel {

    private final List<Map<String, String>> prefixList;
    private final List<VicShape> shapes;

    public ShaclModel(List<Map<String, String>> prefixList, List<VicShape> shapes) {
        this.prefixList = prefixList;
        this.shapes = shapes;
    }

    public List<Map<String, String>> getPrefixList() {
        return prefixList;
    }

    public List<VicShape> getShapes() {
        return shapes;
    }
}
