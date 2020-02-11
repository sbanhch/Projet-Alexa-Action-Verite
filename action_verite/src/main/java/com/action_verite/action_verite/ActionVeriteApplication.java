package com.action_verite.action_verite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@SpringBootApplication
@EnableSwagger2
@EnableAutoConfiguration
public class ActionVeriteApplication {

	public static void main(String[] args) {
		SpringApplication.run(ActionVeriteApplication.class, args);
	}

}
