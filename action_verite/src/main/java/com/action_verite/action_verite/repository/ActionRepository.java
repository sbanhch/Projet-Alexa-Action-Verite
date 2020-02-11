package com.action_verite.action_verite.repository;

import com.action_verite.action_verite.model.Action;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActionRepository extends JpaRepository<Action, Long>, ActionRepositoryCustom {

    public List<Action> findAllByIsActiveNotNull();

    @Query(nativeQuery = true, value = "SELECT * FROM Action s WHERE s.is_active = true ORDER BY RANDOM() LIMIT 1")
    public List<Action> randomAction();
}
