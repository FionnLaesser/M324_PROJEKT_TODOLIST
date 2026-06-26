package com.example.demo.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@SpringBootTest
class ApiVersioningTest {

	@Autowired
	private RequestMappingHandlerMapping handlerMapping;

	@Test
	void controllerRoutesUseV1ApiPrefix() {
		Set<String> apiRoutes = handlerMapping.getHandlerMethods().entrySet().stream()
				.filter(entry -> entry.getValue().getBeanType().getPackageName().equals("com.example.demo.controller"))
				.flatMap(entry -> patterns(entry.getKey()).stream())
				.collect(Collectors.toSet());

		assertThat(apiRoutes)
				.contains(
						"/api/v1/auth/register",
						"/api/v1/auth/login",
						"/api/v1/lists",
						"/api/v1/lists/{listId}/invites",
						"/api/v1/lists/{listId}/todos",
						"/api/v1/lists/{listId}/todos/{todoId}",
						"/api/v1/invitations/{token}/join")
				.allMatch(route -> route.startsWith("/api/v1/"));

		assertThat(apiRoutes)
				.noneMatch(route -> route.startsWith("/api/") && !route.startsWith("/api/v1/"));
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
