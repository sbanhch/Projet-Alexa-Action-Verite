package com.action_verite.action_verite.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class VeriteNotFoundException extends RuntimeException {


    public VeriteNotFoundException(String message) {
        super(message);
    }
}