package eu.gaiax.sdcreationwizard.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClassConstraint {
    private final String prefix;
    private final Object value;

    public ClassConstraint(String prefix, Object value) {
        this.prefix = prefix;
        this.value = value;
    }

    public String getPrefix() {
        return prefix;
    }

    public Object getValue() {
        return value;
    }
}
