package com.rh.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rh.dto.FuncionarioDTO;
import com.rh.model.Funcionario;
import com.rh.service.FuncionarioService;

@RestController
@RequestMapping("/api/v1/funcionario")
public class FuncionarioController {
    
    @Autowired
    FuncionarioService funcionarioService;

    @PostMapping("/cadastrarFuncionario")
    public ResponseEntity<Funcionario> cadastrarFuncionario(@RequestBody FuncionarioDTO dto) {
        return new ResponseEntity<>(funcionarioService.cadastrarFuncionario(dto), HttpStatus.CREATED);
    }

    @GetMapping("/buscarTodos")
    public ResponseEntity<List<Funcionario>> buscarTodos() {
        return ResponseEntity.ok(funcionarioService.buscarTodos());
    }

    @GetMapping("/buscarPorId/{id}")
    public ResponseEntity<Funcionario> buscarFuncionarioPorId(@PathVariable(value = "id") Long id) {
        Funcionario funcionario = funcionarioService.buscarFuncionarioPorId(id);
        return ResponseEntity.ok(funcionario);
    }

    @PutMapping("/atualizarFuncionario/{id}")
    public ResponseEntity<Funcionario> atualizarFuncionario(
        @RequestBody FuncionarioDTO dto,
        @PathVariable(value = "id") Long id
    ) {
        Funcionario funcionario = funcionarioService.atualizarFuncionario(dto, id);
        return ResponseEntity.ok(funcionario);
    }

    @DeleteMapping("/deletarFuncionario/{id}")
    public ResponseEntity<Object> deletarFuncionario(@PathVariable (value = "id") Long id) {
        funcionarioService.deletarFuncionario(id);
        return ResponseEntity.noContent().build();
    }
}
