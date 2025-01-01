package eu.gaiax.sdcreationwizard.api.dto;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseShaclJsonPair{

    private final ShaclModel shaclModel;
    private final Map<String, String> matchedSubjects;

    public ResponseShaclJsonPair(ShaclModel shaclModel, Map<String, String> matchedSubjects) {
        this.shaclModel = shaclModel;
        this.matchedSubjects = matchedSubjects;
    }

    public ShaclModel getShaclModel() {
        return this.shaclModel;
    }

    public Map<String, String> getMatchedSubjects() {
        return this.matchedSubjects;
    }
}
