package com.action_verite.action_verite.repository;

import com.action_verite.action_verite.model.Verite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VeriteRepository extends JpaRepository<Verite, Long> {
}