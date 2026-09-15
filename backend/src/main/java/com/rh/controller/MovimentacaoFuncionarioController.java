package com.rh.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rh.dto.HistoricoMovimentacaoDTO;
import com.rh.dto.MovimentacaoFuncionarioDTO;
import com.rh.model.MovimentacaoFuncionario;
import com.rh.service.MovimentacaoFuncionarioService;

@RestController 
@RequestMapping("/api/v1/movimentacao-funcionario")
public class MovimentacaoFuncionarioController {
    
    @Autowired 
    MovimentacaoFuncionarioService movimentacaoFuncionarioService;

    @PostMapping("/registroMovimentacao")
    public ResponseEntity<MovimentacaoFuncionario> registrarMovimentacao(@RequestBody MovimentacaoFuncionarioDTO dto) {
        return new ResponseEntity<>(movimentacaoFuncionarioService.registrarMovimentacao(dto), HttpStatus.CREATED);
    }

    @GetMapping("/historicoMovimentacao")
    public ResponseEntity<List<HistoricoMovimentacaoDTO>> buscarHistoricoMovimentacao() {
        return ResponseEntity.ok(movimentacaoFuncionarioService.historicoMovimentacao());
    }
}
