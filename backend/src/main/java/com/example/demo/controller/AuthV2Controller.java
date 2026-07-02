package com.example.demo.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiVersionResponse;
import com.example.demo.security.ApiVersionFilter;

@RestController
@RequestMapping(value = "/api/auth", headers = ApiVersionFilter.VERSION_2_HEADER)
public class AuthV2Controller {

	@PostMapping("/login")
	public ApiVersionResponse loginV2() {
		return new ApiVersionResponse(
				ApiVersionFilter.API_VERSION_2,
				"demo",
				"Version 2 verwendet eine eigene Login-Methode.");
	}
}
