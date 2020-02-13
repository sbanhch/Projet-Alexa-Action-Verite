package com.action_verite.action_verite.repositoryImpl;

import com.action_verite.action_verite.model.Action;
import com.action_verite.action_verite.repository.ActionRepository;
import com.action_verite.action_verite.repository.ActionRepositoryCustom;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.math.BigInteger;
import java.util.List;
import java.util.Random;

@Transactional
public class ActionRepositoryImpl implements ActionRepositoryCustom {

    @PersistenceContext
    EntityManager entityManager;

    @Autowired
    private ActionRepository actionRepository;


    public List<Action> getRandomAction(){
        try {

            List<Action> actions = actionRepository.randomAction();

            for (Action action : actions) {

                System.out.println(action);
                action = actionRepository.findById(action.getId());
                Integer id = action.getId();
                updateAction(id);
            }

            return actions;

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
    }

    public List<Action> resetActions(){
        try {

            List<Action> actions = actionRepository.findAll();

            for (Action action : actions) {

                System.out.println(action);
                action = actionRepository.findById(action.getId());
                Integer id = action.getId();
                resetAction(id);
            }

            return actions;

        } catch (NoResultException e) {

            return null;
        }
    }

    public void updateAction(Integer id) {
        Action action = new Action();

        action = actionRepository.findById(id);

        action.setActive(false);

        this.entityManager.persist(action);

        this.entityManager.flush();
    }

    public void resetAction(Integer id) {
        Action action = new Action();

        action = actionRepository.findById(id);

        action.setActive(true);

        this.entityManager.persist(action);

        this.entityManager.flush();
    }

}

