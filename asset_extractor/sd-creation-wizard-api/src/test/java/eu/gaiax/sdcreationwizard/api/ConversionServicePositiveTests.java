package eu.gaiax.sdcreationwizard.api;

import org.apache.commons.io.IOUtils;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameter;
import org.junit.runners.Parameterized.Parameters;
import org.mockito.Mockito;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.rules.SpringClassRule;
import org.springframework.test.context.junit4.rules.SpringMethodRule;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import eu.gaiax.sdcreationwizard.api.dto.ResponseShaclJsonPair;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@RunWith(Parameterized.class)
@WebAppConfiguration
@ContextConfiguration(classes = VicShapeProcessorApplication.class)
public class ConversionServicePositiveTests {

    @ClassRule
    public static final SpringClassRule scr = new SpringClassRule();
    final static String CONVERT_FILE_URL = "/convertFile";
    @Rule
    public final SpringMethodRule smr = new SpringMethodRule();
    @Parameter(value = 0)
    public String inputFilename;
    @Parameter(value = 1)
    public String outputFilename;
    @Parameter(value = 2)
    public boolean strictComparison;

    @Autowired
    private WebApplicationContext wac;
    private MockMvc mockMvc;

    @Parameters(name = "{0}")
    public static Collection<Object[]> filenames() {
        return Arrays.asList(new Object[][]{

                //0. Preliminary test for converting shacl shapes to json object
                {"input-shacl-file.ttl", "output.json", false},

                //1. sh:datatype in shacl file
                {"test-datatype.ttl", "test-datatype-output.json", false},

                //2. custom datatypes in shacl file
                 {"test-datatype2.ttl", "test-datatype2-output.json", false},

                //3. sh:description in shacl file
                {"test-description.ttl", "test-description-output.json", false},

                //4. sh:group in shacl file
                {"test-group.ttl", "test-group-output.json", false},

                //5. sh:in in shacl file with a list of strings
                {"test-in-property.ttl", "test-in-property-output.json", false},

                //6. sh:in handling for different types
                {"test-in-property2.ttl", "test-in-property2-output.json", false},

                //7. sh:maxcount in shacl file
                {"test-max-count.ttl", "test-max-count-output.json", false},

                //8. sh:mincount in shacl file
                {"test-min-count.ttl", "test-min-count-output.json", false},

                //9. sh:maxinclusive in shacl file
                 {"test-max-inclusive.ttl", "test-max-inclusive-output.json", false},

                //10. sh:maxinclusive in shacl file with negative value
                {"test-negative-max-inclusive.ttl", "test-negative-max-inclusive-output.json", false},

                //11. sh:mininclusive in shacl file
                {"test-min-inclusive.ttl", "test-min-inclusive-output.json", false},

                //12. sh:mininclusive in shacl file with negative value
                {"test-negative-min-inclusive.ttl", "test-negative-min-inclusive-output.json", false},

                //13. sh:maxlengtht in shacl file
                        {"test-max-length.ttl", "test-max-length-output.json", false},

                //14. sh:maxlengtht in shacl file with negative value
                 {"test-negative-max-length.ttl", "test-negative-max-length-output.json", false},

                //15. sh:minlength in shacl file
                 {"test-min-length.ttl", "test-min-length-output.json", false},

                //16. sh:minlength in shacl file with negative value
                 {"test-negative-min-length.ttl", "test-negative-min-length-output.json", false},

                //17. sh:order in shacl file
                 {"test-order.ttl", "test-order-output.json", false},

                //18. sh:order in shacl file with negative value
                {"test-negative-order.ttl", "test-negative-order-output.json", false},

                //19. sh:path in shacl file
                 {"test-path.ttl", "test-path-output.json", false},

                //20. multiple not connected shapes in a shacl file
               {"test-multiple-shapes.ttl", "test-multiple-shapes-output.json", false},

                //21. nested shapes in a shacl file
                {"test-nested-shapes.ttl", "test-nested-shapes-output.json", false},

                //22. sh:name in shacl file
                {"test-name.ttl", "test-name-output.json", false},

                //23. sh:minExclusive in shacl file
                {"test-min-exclusive.ttl", "test-min-exclusive-output.json", false},

                //24. sh:minExclusive in shacl file with -ve value
                {"test-negative-min-exclusive.ttl", "test-negative-min-exclusive-output.json", false},

                //25. sh:maxExclusive in shacl file
                 {"test-max-exclusive.ttl", "test-max-exclusive-output.json", false},

                //26. sh:maxExclusive in shacl file with negative value
                {"test-negative-max-exclusive.ttl", "test-negative-max-exclusive-output.json", false},

                //27. sh:class in shacl file
                {"test-class.ttl", "test-class-output.json", false},

                //28. sh:or in shacl file with mincount
               {"test-sh-or-mincount.ttl", "test-sh-or-mincount-output.json", false},

                //29. sh:or in shacl file with maxcount
                {"test-sh-or-maxcount.ttl", "test-sh-or-maxount-output.json", false},

                //30. sh:or in shacl file with datatype and class
                {"test-sh-or.ttl", "test-sh-or-output.json", false},

                //31. unhandled/unsupported properties in shacl file
                {"test-unhandled-properties.ttl", "test-unhandled-properties-output.json", false},

                //32. checking if objects are sorted from high nested level to low / no nested level (leaf to root)
                {"test-complex-structure-sorted.ttl", "test-complex-structure-sorted-output.json", true}
        }
        );
    }

    @Before
    public void setUp() {
        DefaultMockMvcBuilder builder = MockMvcBuilders.webAppContextSetup(this.wac);
        this.mockMvc = builder.build();
        Mockito.mock(ConversionController.class);

    }

    /**
     * method that matches output jsons returned from
     * ConversionService.convertToJson with expected output jsons stored in
     * src/test/java/resources. Input to the method are input shacl filenames and
     * output json filenames stored in test/resources. This method is called from
     * each individual test case involving validating output jsons
     */
    @Test
    public void testOutputJsons() throws Exception {

        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        InputStream inputFile = classloader.getResourceAsStream(inputFilename);
        ResultMatcher ok = MockMvcResultMatchers.status().isOk();
        String outputFile = IOUtils.toString(classloader.getResourceAsStream(outputFilename), StandardCharsets.UTF_8);
        MockMultipartFile mockMultipartFile = new MockMultipartFile("file", inputFilename,
                MediaType.MULTIPART_FORM_DATA_VALUE, inputFile);

        MockHttpServletRequestBuilder builder = MockMvcRequestBuilders.multipart(CONVERT_FILE_URL)
                .file(mockMultipartFile);
        MvcResult mvcResult = mockMvc.perform(builder).andExpect(ok).andReturn();

        JSONAssert.assertEquals(outputFile, mvcResult.getResponse().getContentAsString(), strictComparison);
    }

    /**
     * individual test to test "checkShaclForJson" method
     * takes two files (test-checkShaclForJson.ttl and test-checkShaclForJson.json)
     * checks whether all the keyvalue pairs that match are indeed included in the result
     */
    @Test
    public void testCheckShaclForJson() throws Exception {
        // prepare
        Map<String, String> expectedMap = new HashMap<>();
        expectedMap.put("http://schema.org/name", "msg Systems hospital");
        expectedMap.put("http://schema.org/streetAddress", "Robert-Bürkle-Straße 1");
        expectedMap.put("http://w3id.org/gaia-x/ex#locality", "Ismaning");
        expectedMap.put("http://schema.org/postalCode", "85737^^http://www.w3.org/2001/XMLSchema#integer");
        expectedMap.put("http://w3id.org/gaia-x/ex#countryCode", "DE");
        expectedMap.put("http://w3id.org/gaia-x/ex#number", "123456789^^http://www.w3.org/2001/XMLSchema#integer");

        String individualInputFilename = "test-checkShaclForJson.ttl";
        String individualInputJsonFilname = "test-checkShaclForJson.json";

        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        InputStream inputFile = classloader.getResourceAsStream(individualInputFilename);
        InputStream inputJsonFile = classloader.getResourceAsStream(individualInputJsonFilname);

        MockMultipartFile mockMultipartFileTtl = new MockMultipartFile("fileTtl", individualInputFilename,
                MediaType.MULTIPART_FORM_DATA_VALUE, inputFile);
        MockMultipartFile mockMultipartFileJson = new MockMultipartFile("fileJson", individualInputFilename,
                MediaType.MULTIPART_FORM_DATA_VALUE, inputJsonFile);
        
        // action
        ResponseShaclJsonPair responseShaclJsonPairFromTestFiles = ConversionService.checkShaclForJson(mockMultipartFileTtl, mockMultipartFileJson);
        Map<String, String> actualMap = responseShaclJsonPairFromTestFiles.getMatchedSubjects();
        
        // test
        assertTrue(actualMap.entrySet().containsAll(expectedMap.entrySet()));
    }
}
