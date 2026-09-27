package com.rh.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class EscalaNaoEncontradaException extends RuntimeException{
    public EscalaNaoEncontradaException(Long id) {
        super("Escala não encontrada com o ID: " + id);
    }
}
