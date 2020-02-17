package com.action_verite.action_verite.controller;

import com.action_verite.action_verite.exceptions.ActionNotFoundException;
import com.action_verite.action_verite.model.Action;
import com.action_verite.action_verite.model.Verite;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
	 * @return rien
	 */
	@ApiOperation(value = "Reset la liste de toutes les actions")
	@PutMapping(value = "/action/reset")
	@ResponseBody
	public void resetActions() {

		actionRepository.resetActions();

	}
	
	/**
	 * Retourne une action correspondant au niveau demandé
	 * @param level
	 * @return une actions de niveau "level" (entre 1 et 3)
	 */
	@ApiOperation(value = "Retourne une action correspondant au niveau demandé", response = Action.class)
	@GetMapping("/action/level/{level}")
	@ResponseBody
	public ResponseEntity<Action>  getVeriteByLevel(@PathVariable(value = "level") Integer level) {

		List<Action> actions = actionRepository.randomActionByLevel(level);

		if(actions.size() == 0)  throw new ActionNotFoundException("Il n'y a plus d'action disponible dans le niveau demande");

		return new ResponseEntity<Action>(actionRepository.getRandomActionByLevel(level), HttpStatus.OK);

	}
}