package com.action_verite.action_verite.repository;

import com.action_verite.action_verite.model.Action;

import java.util.List;

public interface ActionRepositoryCustom {

    public List<Action> getRandomAction();

    public List<Action> resetActions();


}
