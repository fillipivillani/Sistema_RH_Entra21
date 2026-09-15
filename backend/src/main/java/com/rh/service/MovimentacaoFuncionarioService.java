package com.rh.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rh.dto.HistoricoMovimentacaoDTO;
import com.rh.dto.MovimentacaoFuncionarioDTO;
import com.rh.model.Cargo;
import com.rh.model.Departamento;
import com.rh.model.Funcionario;
import com.rh.model.MovimentacaoFuncionario;
import com.rh.repository.CargoRepository;
import com.rh.repository.DepartamentoRepository;
import com.rh.repository.FuncionarioRepository;
import com.rh.repository.MovimentacaoFuncionarioRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class MovimentacaoFuncionarioService {

    @Autowired
    MovimentacaoFuncionarioRepository movimentacaoFuncionarioRepository;

    @Autowired 
    FuncionarioRepository funcionarioRepository;

    @Autowired
    CargoRepository cargoRepository;

    @Autowired 
    DepartamentoRepository departamentoRepository;

    @Transactional
    public MovimentacaoFuncionario registrarMovimentacao(MovimentacaoFuncionarioDTO dto) {
        Funcionario funcionario = funcionarioRepository.findById(dto.getFuncionarioId())
            .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));

        Cargo novCargo = cargoRepository.findById(dto.getNovoCargoId())
            .orElseThrow(() -> new RuntimeException("Cargo não encontrado"));

        Departamento novoDepartamento = departamentoRepository.findById(dto.getNovoDepartamentoId())
            .orElseThrow(() -> new RuntimeException("Departamento não encontrado"));

        Cargo antiCargo = funcionario.getCargo();
        Departamento antiDepartamento = funcionario.getDepartamento();
 
        MovimentacaoFuncionario movimentacao = MovimentacaoFuncionario.builder()
            .funcionario(funcionario)
            .cargoAnterior(antiCargo)
            .cargoNovo(novCargo)
            .departamentoAnterior(antiDepartamento)
            .departamentoNovo(novoDepartamento)
            .salarioAnterior(funcionario.getSalario())
            .salarioNovo(dto.getNovoSalario())
            .dataMovimentacao(LocalDateTime.now())
            .observacao(dto.getObservacao())
            .build();

        atualizarFuncionario(movimentacao, funcionario);
        return movimentacaoFuncionarioRepository.save(movimentacao);
    }

    private void atualizarFuncionario(MovimentacaoFuncionario movimentacao, Funcionario funcionario) {
        funcionario.setCargo(movimentacao.getCargoNovo());
        funcionario.setDepartamento(movimentacao.getDepartamentoNovo());
        funcionario.setSalario(movimentacao.getSalarioNovo());
        funcionarioRepository.save(funcionario);
    }

    public List<HistoricoMovimentacaoDTO> historicoMovimentacao() {
        var historico = movimentacaoFuncionarioRepository.buscarHistorico();

        return historico.stream()
            .map(h -> {
                HistoricoMovimentacaoDTO dto = new HistoricoMovimentacaoDTO();
                dto.setNomeFuncionario(h.getNomeFuncionario());
                dto.setCargoAnterior(h.getCargoAnterior());
                dto.setCargoNovo(h.getCargoNovo());
                dto.setDepartamentoAnterior(h.getDepartamentoAnterior());
                dto.setDepartamentoNovo(h.getDepartamentoNovo());
                dto.setSalarioAnterior(h.getSalarioAnterior());
                dto.setSalarioNovo(h.getSalarioNovo());
                dto.setDataMovimentacao(h.getDataMovimentacao());
                dto.setObservacao(h.getObservacao());
                return dto;
            }).toList();
    }
}