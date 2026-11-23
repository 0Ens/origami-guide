package dev.origamiguide.api.catalog;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Web slice test: starts only the MVC layer (controller, JSON, validation, advice).
 * The service is replaced by a mock, so this tests HTTP mapping, not business logic.
 */
@WebMvcTest(CatalogController.class)
class CatalogControllerTest {

    private static final PaperResponse PAPER =
            new PaperResponse(new BigDecimal("15.0"), PaperType.KAMI, "#e5533d", "#ffffff", null);

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CatalogService catalogService;

    @Test
    void listsModels() throws Exception {
        when(catalogService.listModels(any())).thenReturn(List.of(
                new ModelSummaryResponse("dog-face", "Dog face", "A cute dog.", Difficulty.BEGINNER, 5, PAPER)));

        mockMvc.perform(get("/api/models"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("dog-face"))
                .andExpect(jsonPath("$[0].stepCount").value(5))
                .andExpect(jsonPath("$[0].paper.type").value("KAMI"));
    }

    @Test
    void returnsModelWithRawFoldJson() throws Exception {
        when(catalogService.getModel(eq("dog-face"), any())).thenReturn(new ModelDetailResponse(
                "dog-face", "Dog face", "A cute dog.", Difficulty.BEGINNER, PAPER,
                List.of(new StepResponse(1, "Fold in half.", "{\"kind\": \"fold\", \"angle\": 180}"))));

        mockMvc.perform(get("/api/models/dog-face"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.steps[0].number").value(1))
                // The fold is a nested JSON object, not an escaped string.
                .andExpect(jsonPath("$.steps[0].fold.kind").value("fold"))
                .andExpect(jsonPath("$.steps[0].fold.angle").value(180));
    }

    @Test
    void returnsProblemDetailForUnknownModel() throws Exception {
        when(catalogService.getModel(eq("crane"), any())).thenThrow(new ModelNotFoundException("crane"));

        mockMvc.perform(get("/api/models/crane"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.title").value("Model not found"))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.slug").value("crane"));
    }

    @Test
    void rejectsInvalidSlug() throws Exception {
        mockMvc.perform(get("/api/models/Not_A_Slug!"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
    }

    @Test
    void passesAcceptLanguageToService() throws Exception {
        when(catalogService.listModels(Locale.forLanguageTag("tr"))).thenReturn(List.of(
                new ModelSummaryResponse("dog-face", "Kopek yuzu", "Ozet", Difficulty.BEGINNER, 5, PAPER)));

        mockMvc.perform(get("/api/models").header("Accept-Language", "tr"))
                .andExpect(jsonPath("$[0].title").value("Kopek yuzu"));
    }
}
