package com.action_verite.action_verite.controller;

import com.action_verite.action_verite.exceptions.VeriteNotFoundException;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.action_verite.action_verite.model.Verite;
import com.action_verite.action_verite.repository.VeriteRepository;

import java.util.List;

/**
 * Controleur dediee aux traitements sur les vérités
 */
@RestController
@Api(value = "verite", description = "Différentes fonction pour l'évenement verite",
		produces = "application/json")
public class VeriteController {

	@Autowired
	private VeriteRepository veriteRepository;

	/***
	 * Retourne une action selectionner parmis la liste d'action
	 * @return une action
	 */
	@ApiOperation(value = "Retourne la liste de toutes les verites", response = List.class)
	@GetMapping("/verite/all")
	@ResponseBody
	public ResponseEntity<List<Verite>> getAllVerite() {
		return new ResponseEntity<>(this.veriteRepository.findAll(), HttpStatus.OK);
	}

	/***
	 * Retourne une verite selectionnee parmis la liste des verites
	 * @return une verite
	 */
	@ApiOperation(value = "Retourne une verite", response = Verite.class)
	@GetMapping("/verite")
	@ResponseBody
	public ResponseEntity<Verite> getVerite() {

		List<Verite> verites = veriteRepository.randomVerite();

		if(verites.size() == 0)  throw new VeriteNotFoundException("Il n'y a plus de verites disponible");

		return new ResponseEntity<Verite>(veriteRepository.getRandomVerite(), HttpStatus.OK);
	}

	/***
	 * Reset toutes les verites
	 * @return rien
	 */
	@ApiOperation(value = "Reset la liste de toutes les verites")
	@PutMapping(value = "/verite/reset")
	@ResponseBody
	public void resetVerites() {

		veriteRepository.resetVerites();

	}
	
	/**
	 * Retourne une verites correspondant au niveau demande
	 * @param level
	 * @return une verite de niveau "level" (entre 1 et 3)
	 */
	@ApiOperation(value = "Retourne une verite correspondant au niveau demandé", response = List.class)
	@GetMapping("/verite/level/{level}")
	@ResponseBody
	public ResponseEntity<Verite> getVeriteByLevel(@PathVariable(value = "level") Integer level) {

		List<Verite> verites = veriteRepository.randomVeriteByLevel(level);

		if(verites.size() == 0)  throw new VeriteNotFoundException("Il n'y a plus d'action disponible dans le niveau demande");

		return new ResponseEntity<Verite>(veriteRepository.getRandomVeriteByLevel(level), HttpStatus.OK);
    }
	
}
