package com.example.demo.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiVersioningTest {

	@Autowired
	private RequestMappingHandlerMapping handlerMapping;

	@Autowired
	private MockMvc mockMvc;

	@Test
	void controllerRoutesUseNormalApiPrefix() {
		Set<String> apiRoutes = handlerMapping.getHandlerMethods().entrySet().stream()
				.filter(entry -> entry.getValue().getBeanType().getPackageName().equals("com.example.demo.controller"))
				.flatMap(entry -> patterns(entry.getKey()).stream())
				.collect(Collectors.toSet());

		assertThat(apiRoutes)
				.contains(
						"/api/version",
						"/api/auth/register",
						"/api/auth/login",
						"/api/lists",
						"/api/lists/{listId}/invites",
						"/api/lists/{listId}/todos",
						"/api/lists/{listId}/todos/{todoId}",
						"/api/invitations/{token}/join")
				.allMatch(route -> route.startsWith("/api/"));

		assertThat(apiRoutes)
				.noneMatch(route -> route.startsWith("/api/v1/"));
	}

	@Test
	void apiRequestWithoutVersionHeaderReturnsBadRequest() throws Exception {
		mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message", containsString("API-Version")));
	}

	@Test
	void apiRequestWithUnsupportedVersionHeaderReturnsBadRequest() throws Exception {
		mockMvc.perform(post("/api/auth/login")
				.header("X-API-Version", "99")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message", containsString("API-Version")));
	}

	@Test
	void apiRequestWithSupportedVersionHeaderReachesController() throws Exception {
		mockMvc.perform(post("/api/auth/login")
				.header("X-API-Version", "1")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("Eingaben sind ungültig"));
	}

	@Test
	void apiVersionEndpointUsesOwnMethodForVersionOne() throws Exception {
		mockMvc.perform(get("/api/version")
				.header("X-API-Version", "1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.version").value("1"))
				.andExpect(jsonPath("$.status").value("aktiv"));
	}

	@Test
	void apiVersionEndpointUsesOwnMethodForVersionTwo() throws Exception {
		mockMvc.perform(get("/api/version")
				.header("X-API-Version", "2"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.version").value("2"))
				.andExpect(jsonPath("$.message", containsString("eigene Controller-Methode")));
	}

	@Test
	void authLoginUsesOwnMethodForVersionTwo() throws Exception {
		mockMvc.perform(post("/api/auth/login")
				.header("X-API-Version", "2")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.version").value("2"))
				.andExpect(jsonPath("$.message", containsString("eigene Login-Methode")));
	}

	private Set<String> patterns(RequestMappingInfo mappingInfo) {
		if (mappingInfo.getPathPatternsCondition() != null) {
			return mappingInfo.getPathPatternsCondition().getPatternValues();
		}

		if (mappingInfo.getPatternsCondition() != null) {
			return mappingInfo.getPatternsCondition().getPatterns();
		}

		return Set.of();
	}
}
