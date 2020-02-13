package com.action_verite.action_verite.repository;

import com.action_verite.action_verite.model.Action;
import io.swagger.models.auth.In;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActionRepository extends JpaRepository<Action, Long>, ActionRepositoryCustom {

    @Query(nativeQuery = true, value = "SELECT * FROM Action s WHERE s.is_active = true ORDER BY RANDOM() LIMIT 1")
    public List<Action> randomAction();
    
    public List<Action> findByLevel(Integer level);
    
    public Action findById(Integer id);
}
