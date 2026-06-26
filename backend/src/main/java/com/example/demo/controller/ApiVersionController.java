package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiVersionResponse;
import com.example.demo.security.ApiVersionFilter;

@RestController
@RequestMapping("/api/version")
public class ApiVersionController {

	@GetMapping(headers = ApiVersionFilter.VERSION_1_HEADER)
	public ApiVersionResponse getVersionV1() {
		return new ApiVersionResponse(
				ApiVersionFilter.API_VERSION_1,
				"aktiv",
				"Version 1 ist die stabile Todo API.");
	}

	@GetMapping(headers = ApiVersionFilter.VERSION_2_HEADER)
	public ApiVersionResponse getVersionV2() {
		return new ApiVersionResponse(
				ApiVersionFilter.API_VERSION_2,
				"demo",
				"Version 2 verwendet eine eigene Controller-Methode.");
	}
}
