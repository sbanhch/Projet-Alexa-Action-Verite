package com.action_verite.action_verite.repositoryImpl;

import com.action_verite.action_verite.model.Action;
import com.action_verite.action_verite.repository.ActionRepository;
import com.action_verite.action_verite.repository.ActionRepositoryCustom;
import org.springframework.beans.factory.annotation.Autowired;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.math.BigInteger;
import java.util.List;
import java.util.Random;

public class ActionRepositoryImpl implements ActionRepositoryCustom {

    @PersistenceContext
    EntityManager entityManager;

    @Autowired
    private ActionRepository actionRepository;


    public List<Action> getRandomAction(){
        try {

            List<Action> actions = actionRepository.randomAction();


        } catch (NoResultException e) {

            return null;
        }

       /* Query countQuery = entityManager.createNativeQuery("select count(*) from Action");

        Integer count=((BigInteger) countQuery.getSingleResult()).intValue();

        Random random = new Random();
        int number = random.nextInt((int)count);

        Query selectQuery = entityManager.createQuery("select a from Action a");
        selectQuery.setFirstResult(number);
        selectQuery.setMaxResults(1);
        return (Action) selectQuery.getSingleResult();*/


        return null;
    }

}

