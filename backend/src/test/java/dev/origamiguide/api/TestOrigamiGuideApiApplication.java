package dev.origamiguide.api;

import org.springframework.boot.SpringApplication;

public class TestOrigamiGuideApiApplication {

	public static void main(String[] args) {
		SpringApplication.from(OrigamiGuideApiApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
