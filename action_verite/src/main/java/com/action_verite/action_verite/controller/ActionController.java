package com.action_verite.action_verite.controller;

import com.action_verite.action_verite.exceptions.ActionNotFoundException;
import com.action_verite.action_verite.model.Action;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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

		Action actions = actionRepository.getRandomAction();

		return new ResponseEntity<Action>(actions, HttpStatus.OK);
	}

	/***
	 * Reset toutes les actions
	 * @return la liste des actions
	 */
	@ApiOperation(value = "Reset et retourne la liste de toutes les actions", response = List.class)
	@GetMapping("/action/reset")
	@ResponseBody
	public ResponseEntity<List<Action>> resetActions() {

		return new ResponseEntity<>(this.actionRepository.resetActions(), HttpStatus.OK);
	}
}
