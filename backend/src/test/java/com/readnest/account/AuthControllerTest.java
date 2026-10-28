package com.readnest.account;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:readnest-auth-test;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void customerCanRegisterLoginAndLogout() throws Exception {
        String email = "reader-" + UUID.randomUUID() + "@example.com";
        String registration = """
            {"displayName":"ReadNest Reader","email":"%s","password":"correct-horse-42"}
            """.formatted(email);

        MvcResult registrationResult = mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType("application/json")
                .content(registration))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.user.email", is(email)))
            .andExpect(jsonPath("$.user.displayName", is("ReadNest Reader")))
            .andExpect(content().string(not(containsString("correct-horse-42"))))
            .andReturn();

        MockHttpSession registrationSession = (MockHttpSession) registrationResult.getRequest().getSession(false);
        mockMvc.perform(get("/api/auth/me").session(registrationSession))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.user.email", is(email)));

        mockMvc.perform(post("/api/auth/logout").with(csrf()).session(registrationSession))
            .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.user").doesNotExist());

        String login = """
            {"email":"%s","password":"correct-horse-42"}
            """.formatted(email);
        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType("application/json")
                .content(login))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.user.email", is(email)));
    }

    @Test
    void registrationRequiresCsrfAndRejectsDuplicateEmail() throws Exception {
        String email = "reader-" + UUID.randomUUID() + "@example.com";
        String registration = """
            {"displayName":"ReadNest Reader","email":"%s","password":"correct-horse-42"}
            """.formatted(email);

        mockMvc.perform(post("/api/auth/register")
                .contentType("application/json")
                .content(registration))
            .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType("application/json")
                .content(registration))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType("application/json")
                .content(registration.replace(email, email.toUpperCase())))
            .andExpect(status().isConflict());
    }

    @Test
    void invalidCredentialsDoNotAuthenticate() throws Exception {
        String login = """
            {"email":"missing-%s@example.com","password":"incorrect-password"}
            """.formatted(UUID.randomUUID());

        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType("application/json")
                .content(login))
            .andExpect(status().isUnauthorized());
    }
}
