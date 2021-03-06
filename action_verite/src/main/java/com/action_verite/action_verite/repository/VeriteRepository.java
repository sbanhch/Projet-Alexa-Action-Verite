package com.action_verite.action_verite.repository;

import com.action_verite.action_verite.model.Verite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VeriteRepository extends JpaRepository<Verite, Long>, VeriteRepositoryCustom {

    @Query(nativeQuery = true, value = "SELECT * FROM Verite v WHERE v.is_active = true ORDER BY RANDOM() LIMIT 1")
    public List<Verite> randomVerite();

    @Query(nativeQuery = true, value = "SELECT * FROM Verite v WHERE v.is_active = true AND v.level = ?1 ORDER BY RANDOM() LIMIT 1")
    public List<Verite> randomVeriteByLevel(Integer level);

    public List<Verite> findByLevel(Integer level);

    public Verite findById(Integer id);
}