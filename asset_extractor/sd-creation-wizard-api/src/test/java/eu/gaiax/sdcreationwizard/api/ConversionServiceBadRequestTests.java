package eu.gaiax.sdcreationwizard.api;

import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameter;
import org.junit.runners.Parameterized.Parameters;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.rules.SpringClassRule;
import org.springframework.test.context.junit4.rules.SpringMethodRule;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.io.InputStream;
import java.util.Arrays;
import java.util.Collection;

import static org.hamcrest.Matchers.startsWith;

@RunWith(Parameterized.class)
@WebAppConfiguration
@ContextConfiguration(classes = VicShapeProcessorApplication.class)
public class ConversionServiceBadRequestTests {

    @ClassRule
    public static final SpringClassRule scr = new SpringClassRule();
    final static String CONVERT_FILE_URL = "/convertFile";
    @Rule
    public final SpringMethodRule smr = new SpringMethodRule();
    @Parameter()
    public String inputFilename;
    @Autowired
    private WebApplicationContext wac;
    private MockMvc mockMvc;

    @Parameters(name = "{0}")
    public static Collection<Object[]> filenames() {
        return Arrays.asList(new Object[][]{
                // test invalid sh:maxcount value (wrong datatype for eg: string) in shacl file
                {"test-invalid-max-count.ttl"}});
    }

    @Before
    public void setUp() {
        DefaultMockMvcBuilder builder = MockMvcBuilders.webAppContextSetup(this.wac);
        this.mockMvc = builder.build();
        Mockito.mock(ConversionController.class);

    }

    /**
     * tests for cases that return 400 Bad request
     * shapes
     */
    @Test
    public void testBadRequest() throws Exception {

        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        InputStream is = classloader.getResourceAsStream(inputFilename);
        ResultMatcher badRequest = MockMvcResultMatchers.status().isBadRequest();
        ResultMatcher errorMessageBody = MockMvcResultMatchers.content().string(startsWith("Error: "));
        MockMultipartFile mockMultipartFile = new MockMultipartFile("file", inputFilename,
                MediaType.MULTIPART_FORM_DATA_VALUE, is);

        MockHttpServletRequestBuilder builder = MockMvcRequestBuilders.multipart(CONVERT_FILE_URL)
                .file(mockMultipartFile);
        mockMvc.perform(builder).andExpect(badRequest).andExpect(errorMessageBody).andDo(MockMvcResultHandlers.print());
    }

}
