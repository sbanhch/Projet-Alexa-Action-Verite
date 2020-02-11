package com.action_verite.action_verite.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ActionNotFoundException extends RuntimeException {


    public ActionNotFoundException(String message) {
        super(message);
    }
}
