package com.rh.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.rh.interfaces.HistoricoMovimentacaoInterface;
import com.rh.model.MovimentacaoFuncionario;

@Repository
public interface MovimentacaoFuncionarioRepository extends JpaRepository<MovimentacaoFuncionario, Long> {
    
    @Query(value = """
            SELECT
	            f.nome AS nomeFuncionario,
                ca.nome AS cargoAnterior,
                cn.nome AS cargoNovo,
                da.nome AS departamentoAnterior,
                dn.nome AS departamentoNovo,
                CONCAT('R$', mf.salario_anterior) AS salarioAnterior,
                CONCAT('R$',mf.salario_novo) AS salarioNovo,
                mf.data_movimentacao AS dataMovimentacao,
                mf.observacao AS observacao
            FROM movimentacoes_funcionario AS mf
            JOIN funcionarios AS f ON mf.funcionario_id = f.id
            LEFT JOIN cargos AS ca ON mf.cargo_anterior_id = ca.id
            LEFT JOIN cargos AS cn ON mf.cargo_novo_id = cn.id
            LEFT JOIN departamentos AS da ON mf.departamento_anterior_id = da.id
            LEFT JOIN departamentos AS dn ON mf.departamento_novo_id = dn.id
            """, nativeQuery = true)
    List<HistoricoMovimentacaoInterface> buscarHistorico();
}
