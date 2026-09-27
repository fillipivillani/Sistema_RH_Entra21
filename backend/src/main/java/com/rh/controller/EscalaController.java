package com.rh.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.rh.dto.AssociarFuncionarioDTO;
import com.rh.dto.EscalaDTO;
import com.rh.model.Escala;
import com.rh.model.FuncionarioEscala;
import com.rh.service.EscalaService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/escalas")
public class EscalaController {

    @Autowired
    private EscalaService escalaService;

    @PostMapping
    public ResponseEntity<Escala> cadastrarEscala(@RequestBody EscalaDTO dto) {
        Escala novaEscala = escalaService.criarEscala(dto);
        // return ResponseEntity.ok(novaEscala);
        return new ResponseEntity<>(novaEscala, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Escala>> listarEscalas() {
        List<Escala> escalas = escalaService.listarEscalas();
        return ResponseEntity.ok(escalas);
    }

    @PostMapping("/associar")
    public ResponseEntity<FuncionarioEscala> associarFuncionario(@RequestBody AssociarFuncionarioDTO dto) {
        FuncionarioEscala associacao = escalaService.associarFuncionario(dto);
        return new ResponseEntity<>(associacao, HttpStatus.CREATED);
    }
}