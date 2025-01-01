package eu.gaiax.sdcreationwizard.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ShapeProperties {
    private final ClassConstraint path;
    private final String name;
    private final Map<String, String> datatype;
    private final ClassConstraint clazz;
    private final Integer minCount;
    private final Integer maxCount;
    private final Map<String, String> description;
    private  final String example;
    private final List<ClassConstraint> in;
    private final Integer order;
    private final List<ConstraintOption> validations;
    private final String children;
    private final List<ShapeProperties> or;

    public ShapeProperties(ClassConstraint path, String name, Map<String, String> datatype, ClassConstraint clazz, Integer minCount, Integer maxCount,
                           List<ClassConstraint> in, Integer order, List<ConstraintOption> validations, String children,
                           Map<String, String> description, String example, List<ShapeProperties> or) {
        this.path = path;
        this.name = name;
        this.datatype = datatype;
        this.clazz = clazz;
        this.minCount = minCount;
        this.maxCount = maxCount;
        this.in = in;
        this.order = order;
        this.validations = validations;
        this.children = children;
        this.description = description;
        this.example = example;
        this.or = or;
    }

    public ShapeProperties(ClassConstraint path, String name, Map<String, String> datatype, ClassConstraint clazz, Integer minCount, Integer maxCount) {
        this(path, name, datatype, clazz, minCount, maxCount, null, null, null, null, null, null, null);
    }

    public ClassConstraint getPath() {
        return path;
    }

    public String getName() {
        return name;
    }

    public Map<String, String> getDatatype() {
        return datatype;
    }

    public ClassConstraint getClazz() {
        return clazz;
    }

    public Integer getMinCount() {
        return minCount;
    }

    public Integer getMaxCount() {
        return maxCount;
    }

    public Map<String, String> getDescription() {
        return description;
    }

    public String getExample(){
        return  example;
    }

    public List<ClassConstraint> getIn() {
        return in;
    }

    public Integer getOrder() {
        return order;
    }

    public List<ConstraintOption> getValidations() {
        return validations;
    }

    public String getChildren() {
        return children;
    }

    public List<ShapeProperties> getOr() {
        return or;
    }

}
