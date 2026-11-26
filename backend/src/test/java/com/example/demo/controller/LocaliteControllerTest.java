package com.example.demo.controller;

import com.example.demo.service.AdresseService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LocaliteController.class)
class LocaliteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdresseService adresseService;

    @Test
    void renvoieLesVillesDuCodePostal() throws Exception {
        when(adresseService.localites("4000")).thenReturn(List.of("Glain", "Liège", "Rocourt"));

        mockMvc.perform(get("/api/localites").param("codePostal", "4000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[1]").value("Liège"));
    }

    // Code inconnu : 200 et liste vide, c'est au formulaire de le dire
    @Test
    void renvoieUneListeVidePourUnCodeInconnu() throws Exception {
        when(adresseService.localites("9999")).thenReturn(List.of());

        mockMvc.perform(get("/api/localites").param("codePostal", "9999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
