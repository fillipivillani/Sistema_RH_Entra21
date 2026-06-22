package com.rh.controller;

import java.util.List;

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

import com.rh.dto.DepartamentoDTO;
import com.rh.model.Departamento;
import com.rh.service.DepartamentoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/departamento")
@RequiredArgsConstructor
public class DepartamentoController {
    private final DepartamentoService departamentoService;

    @PostMapping("/criarDepartamento")
    public ResponseEntity<Departamento> cadastrarDepartamento(@RequestBody DepartamentoDTO dto) {
        return new ResponseEntity<>(departamentoService.cadastrarDepartamento(dto), HttpStatus.CREATED);
    }

    @GetMapping("/buscarTodos")
    public ResponseEntity<List<Departamento>> buscarTodos() {
        return new ResponseEntity<>(departamentoService.buscarTudo(), HttpStatus.OK);
    }

    @GetMapping("/buscarPorId/{id}")
    public ResponseEntity<Departamento> buscarDepartamentoPorId(@PathVariable(value = "id") Long id) {
        Departamento departamento = departamentoService.buscarDepartamentoPorId(id);
        return ResponseEntity.ok(departamento);
    }

    @PutMapping("/editarDepartamento/{id}")
    public ResponseEntity<Departamento> editarDepartamento(
        @RequestBody DepartamentoDTO dto, 
        @PathVariable(value = "id") Long id
    ) {
        Departamento departamento = departamentoService.editarDepartamento(dto, id);
        return ResponseEntity.ok(departamento);
    }

    @DeleteMapping("/deletarDepartamento/{id}")
    public ResponseEntity<Object> deletarDepartamento(@PathVariable(value = "id") Long id) {
        departamentoService.deletarDepartamento(id);
        return ResponseEntity.noContent().build();
    }
}
