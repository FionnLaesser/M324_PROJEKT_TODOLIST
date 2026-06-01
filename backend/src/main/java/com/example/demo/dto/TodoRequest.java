package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TodoRequest(
		@NotBlank(message = "Todo-Text ist Pflicht")
		@Size(max = 255, message = "Todo-Text darf maximal 255 Zeichen haben")
		String taskdescription,

		@Pattern(regexp = "^$|\\d{4}-\\d{2}-\\d{2}", message = "Datum muss im Format YYYY-MM-DD sein")
		String dueDate,

		@Pattern(regexp = "^(Niedrig|Mittel|Hoch)?$", message = "Priorität muss Niedrig, Mittel oder Hoch sein")
		String priority) {
}
