package com.action_verite.action_verite.repositoryImpl;

import com.action_verite.action_verite.model.Verite;
import com.action_verite.action_verite.repository.VeriteRepository;
import com.action_verite.action_verite.repository.VeriteRepositoryCustom;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import java.util.List;

@Transactional
public class VeriteRepositoryImpl implements VeriteRepositoryCustom {

    @PersistenceContext
    EntityManager entityManager;

    @Autowired
    private VeriteRepository veriteRepository;

    @Override
    public Verite getRandomVerite() {
        try {

            List<Verite> verites = veriteRepository.randomVerite();

            for (Verite verite : verites) {

                System.out.println(verite);
                verite = veriteRepository.findById(verite.getId());
                Integer id = verite.getId();
                updateVerite(id);
            }

            return verites.get(0);

        } catch (NoResultException e) {

            return null;
        }

    }

    public Verite getRandomVeriteByLevel(Integer level){
        try {

            List<Verite> verites = veriteRepository.randomVeriteByLevel(level);

            for (Verite verite : verites) {

                System.out.println(verite);

                verite = veriteRepository.findById(verite.getId());
                Integer id = verite.getId();
                updateVerite(id);
            }

            return verites.get(0);

        } catch (NoResultException e) {

            return null;
        }
    }

    public void updateVerite(Integer id) {
        Verite verite = new Verite();

        verite = veriteRepository.findById(id);

        verite.setActive(false);

        this.entityManager.persist(verite);

        this.entityManager.flush();
    }

    public String resetVerites(){
        try {

            List<Verite> verites = veriteRepository.findAll();

            for (Verite verite : verites) {

                System.out.println(verite);
                verite = veriteRepository.findById(verite.getId());
                Integer id = verite.getId();
                resetVerite(id);
            }

            return "Reset réussi";

        } catch (NoResultException e) {

            return "Erreur du reset :" + e;
        }
    }

    public void resetVerite(Integer id) {
        Verite verite = new Verite();

        verite = veriteRepository.findById(id);

        verite.setActive(true);

        this.entityManager.persist(verite);

        this.entityManager.flush();
    }

}
