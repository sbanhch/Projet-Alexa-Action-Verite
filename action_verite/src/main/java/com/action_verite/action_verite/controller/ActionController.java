package com.action_verite.action_verite.controller;

import com.action_verite.action_verite.exceptions.ActionNotFoundException;
import com.action_verite.action_verite.model.Action;
import com.action_verite.action_verite.model.Verite;

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

import com.action_verite.action_verite.repository.ActionRepository;

import java.util.List;


/**
 * Controleur dediee aux traitements sur les actions
 */
@RestController
@Api(value = "action", description = "Différentes fonction pour l'évenement action",
		produces = "application/json")
public class ActionController {

	@Autowired
	private ActionRepository actionRepository;

	/***
	 * Retourne toutes les actions selectionner parmis la liste d'action
	 * @return une action
	 */
	@ApiOperation(value = "Retourne la liste de toutes les actions", response = List.class)
	@GetMapping("/action/all")
	@ResponseBody
	public ResponseEntity<List<Action>> getAllActions() {
		return new ResponseEntity<>(this.actionRepository.findAll(), HttpStatus.OK);
	}

	/***
	 * Retourne une action selectionnee parmis la liste d'action
	 * @return une action
	 */
	@ApiOperation(value = "Retourne une action", response = Action.class)
	@GetMapping("/action")
	@ResponseBody
	public ResponseEntity<Action> getAction() {

		List<Action> actions = actionRepository.randomAction();

		if(actions.size() == 0)  throw new ActionNotFoundException("Il n'y a plus d'action disponible");

		return new ResponseEntity<Action>(actionRepository.getRandomAction(), HttpStatus.OK);
	}

	/***
	 * Reset toutes les actions
	 * @return la liste des actions
	 */
	@ApiOperation(value = "Reset et retourne la liste de toutes les actions", response = List.class)
	@PostMapping("/action/reset")
	@ResponseBody
	public ResponseEntity<String> resetActions() {

		return new ResponseEntity<>(this.actionRepository.resetActions(), HttpStatus.OK);
	}
	
	/**
	 * Retourne la liste des actions correspondant au niveau demandé
	 * @param level
	 * @return liste des actions de niveau "level" (entre 1 et 3)
	 */
	@ApiOperation(value = "Retourne la liste des actions correspondant au niveau demandé", response = List.class)
	@PutMapping("/action/level/{level}")
	@ResponseBody
	public List<Action> getVeriteByLevel(@PathVariable(value = "level") Integer level) {
		return actionRepository.findByLevel(level);

	}
	
}
