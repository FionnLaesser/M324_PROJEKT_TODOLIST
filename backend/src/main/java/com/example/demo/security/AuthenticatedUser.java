package com.example.demo.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.demo.model.AppUser;

public class AuthenticatedUser implements UserDetails {

	private final Long id;
	private final String username;
	private final String passwordHash;
	private final String role;

	public AuthenticatedUser(AppUser user) {
		id = user.getId();
		username = user.getUsername();
		passwordHash = user.getPasswordHash();
		role = user.getRole().name();
	}

	public Long getId() {
		return id;
	}

	public String getRole() {
		return role;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_" + role));
	}

	@Override
	public String getPassword() {
		return passwordHash;
	}

	@Override
	public String getUsername() {
		return username;
	}
}
