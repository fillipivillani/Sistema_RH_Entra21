package com.rh.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class DepartamentoNaoEncontradoException extends RuntimeException {
    public DepartamentoNaoEncontradoException(Long id) {
        super("Departamento com id " + id + " não foi encontrado");
    }
}
