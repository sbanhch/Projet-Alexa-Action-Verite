package com.action_verite.action_verite.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.action_verite.action_verite.repository.VeriteRepository;



@RestController
/**
 * Controleur dediee aux traitements sur les actions
 */
public class VeriteController {

	@Autowired
	private  VeriteRepository bdVerite;
	
	
	@RequestMapping("/verite")
	public String envoyerVerite() {
		
		return "String";
	}

}
