package com.action_verite.action_verite.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;

@Entity
@Table(name = "Verite", uniqueConstraints = {@UniqueConstraint(columnNames = "verite")})
public class Verite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer id;

    private String verite;

    private Integer level;

    private Boolean isActive;

    public Verite() {
    }

    public Verite(String verite, Integer level, Boolean isActive) {
        this.verite = verite;
        level = level;
        this.isActive = isActive;
    }

    @JsonIgnore
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getVerite() {
        return verite;
    }

    public void setVerite(String verite) {
        this.verite = verite;
    }

    public Integer getlevel() {
        return level;
    }

    public void setlevel(Integer level) {
        level = level;
    }

    @JsonIgnore
    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }

    @Override
    public String toString() {
        return "Verite{" +
                "id=" + id +
                ", verite='" + verite + '\'' +
                ", level=" + level +
                ", isActive=" + isActive +
                '}';
    }
}
