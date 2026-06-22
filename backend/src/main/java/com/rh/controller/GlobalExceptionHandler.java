package com.rh.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.rh.exception.DepartamentoNaoEncontradoException;
import com.rh.exception.ErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DepartamentoNaoEncontradoException.class)
    public ResponseEntity<ErrorResponse> HandlerDepartamentoNaoEncontrado(DepartamentoNaoEncontradoException e) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND.value());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }
}
