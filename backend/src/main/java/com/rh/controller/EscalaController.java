package com.sistema.rh.controller;

import com.sistema.rh.dto.AssociarFuncionarioDTO;
import com.sistema.rh.dto.EscalaDTO;
import com.sistema.rh.model.Escala;
import com.sistema.rh.model.FuncionarioEscala;
import com.sistema.rh.service.EscalaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/escalas")
public class EscalaController {

    @Autowired
    private EscalaService escalaService;

    @PostMapping
    public ResponseEntity<Escala> cadastrarEscala(@RequestBody EscalaDTO dto) {
        Escala novaEscala = escalaService.criarEscala(dto);
        return ResponseEntity.ok(novaEscala);
    }

    @GetMapping
    public ResponseEntity<List<Escala>> listarEscalas() {
        List<Escala> escalas = escalaService.listarEscalas();
        return ResponseEntity.ok(escalas);
    }

    @PutMapping("/associar")
    public ResponseEntity<FuncionarioEscala> associarFuncionario(@RequestBody AssociarFuncionarioDTO dto) {
        FuncionarioEscala associacao = escalaService.associarFuncionario(dto);
        return ResponseEntity.ok(associacao);
    }
}