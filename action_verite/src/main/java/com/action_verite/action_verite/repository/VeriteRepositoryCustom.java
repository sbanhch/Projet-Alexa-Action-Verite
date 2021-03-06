package com.action_verite.action_verite.repository;

import com.action_verite.action_verite.model.Verite;

import java.util.List;

public interface VeriteRepositoryCustom {

    public Verite getRandomVerite();

    public Verite getRandomVeriteByLevel(Integer level);

    public String resetVerites();
}
