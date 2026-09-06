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

import com.rh.dto.CargoDTO;
import com.rh.model.Cargo;
import com.rh.service.CargoService;

@RestController
@RequestMapping("/api/v1/cargo")
public class CargoController {

    @Autowired 
    CargoService cargoService;

    @PostMapping("/cadastrarCargo")
    public ResponseEntity<Cargo> cadastrarCargo(@RequestBody CargoDTO dto) {
        return new ResponseEntity<>(cargoService.cadastrarCargo(dto), HttpStatus.CREATED);
    }

    @GetMapping("/buscarTodos")
    public ResponseEntity<List<Cargo>> buscarTodos() {
        return new ResponseEntity<>(cargoService.buscarTodos(), HttpStatus.OK);
    }

    @GetMapping("/buscarPorId/{id}")
    public ResponseEntity<Cargo> buscarCargoPorId(@PathVariable(value = "id") Long id) {
        Cargo cargo = cargoService.buscarCargoPorId(id);
        return ResponseEntity.ok(cargo);
    }

    @PutMapping("/editarCargo/{id}")
    public ResponseEntity<Cargo> editarCargo(
        @RequestBody CargoDTO dto, 
        @PathVariable(value = "id") Long id
    ) {
        Cargo cargo = cargoService.editarCargo(dto, id);
        return ResponseEntity.ok(cargo);
    }

    @DeleteMapping("/deletarCargo/{id}")
    public ResponseEntity<Object> deletarCargo(@PathVariable(value = "id") Long id) {
        cargoService.deletarCargo(id);
        return ResponseEntity.noContent().build();
    }
}
