package com.action_verite.action_verite.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;

@Entity
@Table(name = "Action", uniqueConstraints = {@UniqueConstraint(columnNames = "action")})
public class Action {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer id;

    private String action;

    private Integer level;

    private Boolean isActive;

    public Action() {
    }

    public Action(String action, Integer level, Boolean isActive) {
        this.action = action;
        this.level = level;
        this.isActive = isActive;
    }

    @JsonIgnore
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
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
        return "Action{" +
                "id=" + id +
                ", action='" + action + '\'' +
                ", level=" + level +
                ", isActive=" + isActive +
                '}';
    }
}
