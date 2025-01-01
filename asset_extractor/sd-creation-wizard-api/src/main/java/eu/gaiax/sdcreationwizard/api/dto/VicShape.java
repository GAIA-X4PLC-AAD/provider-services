package eu.gaiax.sdcreationwizard.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class VicShape {
    private final String schema;
    private final String targetClassPrefix;
    private final String targetClassName;
    private final List<ShapeProperties> constraints;

    public VicShape(List<ShapeProperties> constraints, String schema, String targetClassPrefix, String targetClassName) {
        this.targetClassPrefix = targetClassPrefix;
        this.constraints = (null == constraints || constraints.isEmpty() ? null : new ArrayList<>(constraints));
        this.schema = schema;
        this.targetClassName = targetClassName;
    }

    public String getSchema() {
        return schema;
    }

    public String getTargetClassPrefix() {
        return targetClassPrefix;
    }

    public String getTargetClassName() {
        return targetClassName;
    }

    public List<ShapeProperties> getConstraints() {
        return (constraints == null) ? new ArrayList<>() : Collections.unmodifiableList(constraints);
    }
}
