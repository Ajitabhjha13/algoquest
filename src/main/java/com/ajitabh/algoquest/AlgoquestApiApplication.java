package com.ajitabh.algoquest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan // @ConfigurationProperties wali classes (jaise AppProperties) dhoondh ke bharo
public class AlgoquestApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(AlgoquestApiApplication.class, args);
	}
}
