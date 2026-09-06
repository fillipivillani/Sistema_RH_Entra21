package com.rh.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rh.dto.FuncionarioDTO;
import com.rh.exception.CargoNaoEncontradoException;
import com.rh.exception.DepartamentoNaoEncontradoException;
import com.rh.exception.FuncionarioNaoEncontradoException;
import com.rh.model.Cargo;
import com.rh.model.Departamento;
import com.rh.model.Funcionario;
import com.rh.repository.CargoRepository;
import com.rh.repository.DepartamentoRepository;
import com.rh.repository.FuncionarioRepository;

@Service
public class FuncionarioService {

    @Autowired
    FuncionarioRepository funcionarioRepository;

    @Autowired
    DepartamentoRepository departamentoRepository;

    @Autowired
    CargoRepository cargoRepository;

    public Funcionario cadastrarFuncionario(FuncionarioDTO dto) {
        Departamento departamento = departamentoRepository.findById(dto.getDepartamentoId())
                .orElseThrow(() -> new DepartamentoNaoEncontradoException(dto.getDepartamentoId()));

        Cargo cargo = cargoRepository.findById(dto.getCargoId())
                .orElseThrow(() -> new CargoNaoEncontradoException(dto.getCargoId()));

        Funcionario funcionario = Funcionario.builder()
                .nome(dto.getNome())
                .cpf(dto.getCpf())
                .rg(dto.getRg())
                .dataNascimento(dto.getDataNascimento())
                .telefone(dto.getTelefone())
                .email(dto.getEmail())
                .endereco(dto.getEndereco())
                .dataAdmissao(dto.getDataAdmissao())
                .salario(dto.getSalario())
                .foto(dto.getFoto())
                .cargo(cargo)
                .departamento(departamento)
                .build();

        return funcionarioRepository.save(funcionario);
    }

    public List<Funcionario> buscarTodos() {
        return funcionarioRepository.findAll();
    }

    public Funcionario buscarFuncionarioPorId(Long id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new FuncionarioNaoEncontradoException(id));
    }

    public Funcionario atualizarFuncionario(FuncionarioDTO dto, Long id) {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new FuncionarioNaoEncontradoException(id));

        Departamento departamento = departamentoRepository.findById(dto.getDepartamentoId())
                .orElseThrow(() -> new DepartamentoNaoEncontradoException(dto.getDepartamentoId()));

        Cargo cargo = cargoRepository.findById(dto.getCargoId())
                .orElseThrow(() -> new CargoNaoEncontradoException(dto.getCargoId()));

        funcionario.setNome(dto.getNome());
        funcionario.setCpf(dto.getCpf());
        funcionario.setRg(dto.getRg());
        funcionario.setDataNascimento(dto.getDataNascimento());
        funcionario.setTelefone(dto.getTelefone());
        funcionario.setEmail(dto.getEmail());
        funcionario.setEndereco(dto.getEndereco());
        funcionario.setDataAdmissao(dto.getDataAdmissao());
        funcionario.setSalario(dto.getSalario());
        funcionario.setFoto(dto.getFoto());
        funcionario.setCargo(cargo);
        funcionario.setDepartamento(departamento);

        return funcionarioRepository.save(funcionario);
    }

    public void deletarFuncionario(Long id) {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new FuncionarioNaoEncontradoException(id));

        funcionarioRepository.delete(funcionario);
    }
    
}
