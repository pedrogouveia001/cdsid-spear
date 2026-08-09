// Relayer for browser console logs to Flask stdout
(function() {
    const oldLog = console.log;
    const oldError = console.error;
    
    function sendLog(type, args) {
        const msg = Array.from(args).map(arg => {
            if (typeof arg === 'object') {
                try { return JSON.stringify(arg); } catch (e) { return String(arg); }
            }
            return String(arg);
        }).join(' ');
        fetch('/api/log', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: `[${type}] ${msg}` })
        }).catch(() => {});
    }

    console.log = function() {
        oldLog.apply(console, arguments);
        sendLog('LOG', arguments);
    };
    console.error = function() {
        oldError.apply(console, arguments);
        sendLog('ERROR', arguments);
    };

    window.addEventListener('error', function(e) {
        sendLog('UNCAUGHT_ERROR', [e.message, 'at', e.filename + ':' + e.lineno + ':' + e.colno]);
    });

    window.addEventListener('unhandledrejection', function(e) {
        sendLog('UNHANDLED_REJECTION', [e.reason]);
    });
})();

// --- Internationalization (i18n) & Translation Dictionary ---
const translations = {
    en: {
        // Base / Navigation
        "logout": "Logout",
        "user": "User",
        "back": "<< Back",
        "system_title": "SPEAR Decision System",
        // Welcome
        "register_user": "Register user",
        "login": "Login",
        "warning_text": "⚠️ Warning: We advert that this version includes some new features. If any error is found, please send an e-mail to: cdsid.ufpe@gmail.com",
        // Login / Register
        "email": "E-mail:",
        "password": "Password:",
        "confirm_password": "Confirm Password:",
        "forgot_password": "Forgot password?",
        "enter": "Enter",
        "register": "Register",
        "error_required": "Email and password are required.",
        "error_mismatch": "Passwords do not match.",
        "error_exists": "Email already exists.",
        "error_invalid_login": "Invalid email or password.",
        // Options
        "choose_option": "Please, choose an option:",
        "register_new_problem": "Register new problem",
        "continue_registered_issue": "Continue a registered issue",
        // Continue
        "no_saved_problems": "No saved problems found. Please register a new problem.",
        "wait_note": "*It can take a few seconds, please wait.",
        "select": "Select",
        "select_problem_first": "Please select a problem first.",
        // Setup
        "step1_title": "Step 1: Setup Parameters",
        "problem_name": "Problem Name:",
        "num_crit": "Number of Criteria:",
        "num_alt": "Number of Alternatives:",
        "update_matrix": "Update Matrix Size",
        "import_file": "Or Import Data File",
        "drag_drop": "Drag & Drop file here or browse",
        "supports": "Supports .csv or .xlsx",
        "step2_title": "Step 2: Consequence Matrix",
        "crit_types_info": "🛈 Criterion Types Info",
        "crit_types_guide": "Criterion Types Guide:",
        "crit_type_cont_min": "Continuous Min",
        "crit_type_cont_max": "Continuous Max",
        "crit_type_disc_min": "Discrete Min",
        "crit_type_disc_max": "Discrete Max",
        "crit_type_int_min": "Integer Min",
        "crit_type_int_max": "Integer Max",
        "continuous_guide": "Continuous Min/Max: Represent continuous metrics (e.g. costs or weight).",
        "discrete_guide": "Discrete Min/Max: Represent quality or performance levels. Requires levels.",
        "integer_guide": "Integer Min/Max: Represent whole count measurements.",
        "levels_discrete": "Levels (Discrete)",
        "save_problem": "Save problem",
        "show_results": "Show Results",
        "alt_crit_header": "Alternatives \\ Criteria",
        "type_header": "Type",
        "invalid_dimensions": "Invalid dimensions",
        "imported_success": "Problem saved successfully!",
        "load_error": "Error loading problem: ",
        // Results
        "recalculating": "Recalculating partial results...",
        "results": "Results",
        "export_json": "Export JSON",
        "export_pdf": "Export PDF",
        "tab_additive": "Additive Results (ROC)",
        "tab_outranking": "Outranking Results (PROMETHEE)",
        "tab_rules": "Decision Rules",
        "tab_filters": "Interactive Elicitation",
        "tab_distributions": "Global Value Distributions",
        "subtab_freq": "Frequencies & Chart",
        "subtab_stats": "Simulation Statistics",
        "subtab_elicitation": "Elicitation Analysis",
        "freq_solutions": "Frequency of Solutions",
        "alt_results": "Alternatives Results",
        "alt_sol_header": "Alternative / Solution",
        "freq_header": "Frequency",
        "avg_std_dev": "Average & Standard Deviation",
        "max_min": "Max & Min (Dmax / Dmin)",
        "impact_crit": "Impact of Criteria Preferences",
        "prob_x": "Probability of X",
        "prob_z": "Probability of Z",
        "prob_others": "Probability of Others",
        "roc_rec": "ROC Recommendation",
        "promethee_rec": "PROMETHEE Recommendation",
        "crit_rank_filters": "Criteria Ordering",
        "any_criterion": "Any Criterion",
        "matching_perms": "Matching Permutations:",
        "reset_filters": "Clear Preferences",
        "prob_analysis": "Probability Analysis of Alternatives",
        "prob_comparison": "Probability Comparison",
        "prob_being_sol": "Probability of Being a Solution",
        "original_prob": "Original Prob",
        "filtered_prob": "Filtered Prob",
        "difference": "Difference",
        "global_val_dist": "Global Value Distributions under Preferences",
        "filters_none": "Preferences: None",
        "filters_badge_prefix": "Preferences: ",
        "val_profile_curve": "Value Profile Curve",
        "range_bar_chart": "Range Bar Chart",
        "holistic_evals": "Holistic Evaluation",
        "holistic_desc": "Define global preferences between alternatives (e.g., A ≥ B). Only alternatives with non-zero solution probability are shown. Click on a preference row to select it and compare consequences.",
        "add_preference": "+ Add Preference",
        "apply_holistic": "Apply Holistic Preferences",
        "clear_all": "Clear All",
        "conseq_comparison": "Consequence Comparison",
        "conseq_placeholder": "Select a holistic preference on the left (or add one and click its comparison icon) to compare consequences.",
        "comparing_alts": "Comparing Alt A vs Alt B",
        "display_alts": "Display Alternatives (only those solved at least once are shown)",
        "global_val_stats": "Global Value Statistics",
        "global_val_chart": "Global Value Distribution Chart",
        "min": "Min",
        "avg": "Average (μ)",
        "max": "Max",
        "std": "Std Dev (σ)",
        "alternative": "Alternative",
        "original_prob_col": "Original Prob",
        "filtered_prob_col": "Filtered Prob",
        "difference_col": "Difference",
        "crit_col": "Criterion",
        "type_col": "Type",
        "diff_col": "Diff",
        "better_col": "Better",
        "tie": "Tie",
        "comparing_alts_prefix": "Comparing: ",
        "no_compat_order": "No compatible criteria order found.",
        "select_alt_display": "Select at least one alternative to display.",
        "no_solved_alts": "No solved alternatives under current filters.",
        "conflict_filter": "Conflict: The same criterion cannot be selected for multiple positions.",
        "conflict_holistic": "Error: An alternative cannot be compared to itself.",
        "loading_problem": "⏳ Loading problem data...",
        "running": "Running...",
        "save_success": "Problem saved successfully!",
        // Extra dynamic strings added for charts/alerts
        "normalized_perf": "Normalized Performance [0, 1]",
        "prob_pct": "Probability (%)",
        "dist_roc_title": "Global Values (ROC) Distribution",
        "dist_prom_title": "Net Outranking Flows (PROMETHEE) Distribution",
        "utility": "Global Value",
        "net_flow": "Net Flow",
        "percentile_perms": "Percentile of Permutations (%)",
        "val_range": "Value Range [Min, Max]",
        "import_error_prefix": "Import error: ",
        "import_fail": "Failed to import file.",
        "no_results_found": "No results found. Please run a simulation first.",
        "no_results_export": "No results to export.",
        "pdf_gen_fail_prefix": "Failed to generate PDF report: ",
        "save_error_prefix": "Error saving problem: ",
        "save_fail": "Failed to save problem.",
        "problem_not_found": "Problem not found or you do not have access to it.",
        "load_error_prefix": "Error loading problem: ",
        "load_fail": "Failed to load the selected problem. Check the console for details.",
        "error_prefix": "Error: ",
        "network_error": "Network Error",
        "saved_on_prefix": "Saved on: ",
        "at_pos": "at",
        "position_label": "Position",
        "rationality": "Rationality:",
        "compensatory": "Compensatory",
        "non_compensatory": "Non-compensatory",
        "partial_results": "Partial Results",
        "final_results": "Final Results",
        "elicitation": "Elicitation",
        "criteria_ordering": "Criteria Ordering",
        "holistic_evaluation": "Holistic Evaluation",
        "global_value_analysis": "Global Value Analysis",
        "concluded_success": "Elicitation concluded successfully! A single final solution was found:",
        "restart_elicitation": "Restart Elicitation",
        "winning_solution": "Winning Solution:",
        "active_preferences": "Active Preferences:",
        "applied_filters": "Applied Preferences:",
        "winner_consequences": "Consequences of the Winning Alternative",
        "winner_global_value_range": "Winning Alternative's Global Value Range",
        "winner_net_flow_range": "Winning Alternative's Net Flow Range",
        "criteria_weights_range": "Criteria Weights Ranges",
        "direction_col": "Preference Direction",
        "value_col": "Value",
        "crit_type_continuous": "Continuous",
        "crit_type_discrete": "Discrete",
        "crit_type_integer": "Integer",
        "crit_dir_min": "Minimization",
        "crit_dir_max": "Maximization",
        "global_val_range": "Global Value Range [Min, Max]",
        "weight_range": "Weight Range [Min, Max]",
        "loss_average_title": "Average Loss when not a Solution",
        "loss_limits_title": "Loss Limits when not a Solution (Dmax / Dmin)",
        "loss_average_desc": "Calculates the average loss (difference in global value compared to the winning alternative) in the simulated cases where the alternative was not the chosen solution.",
        "loss_limits_desc": "Calculates the maximum and minimum losses in the simulated cases where the alternative was not the chosen solution.",
        "average_loss": "Average Loss",
        "max_loss": "Max Loss",
        "min_loss": "Min Loss",
        "swing_title": "Criteria Scale Visualization (SWING Procedure)",
        "select_alt_view": "Select an Alternative to Visualize:",
        "run_sensitivity": "Sensitivity Analysis",
        "sensitivity_analysis_title": "Sensitivity Analysis (Monte Carlo Simulation)",
        "sensitivity_desc": "Set the variation percentages for consequences (relative to each criterion's amplitude). The system runs 10,000 Monte Carlo simulations to evaluate the likelihood of each alternative winning under uncertainty.",
        "as_parameters": "Parameter Setup",
        "set_all_variations": "Global Variation (apply to all):",
        "apply": "Apply",
        "back_to_results": "Back to Results",
        "run_analysis": "Run Simulation",
        "as_results": "Simulation Results",
        "prob_winning_chart": "Probability of Success (%)",
        "original_best_prob": "Original Freq (Permutations)",
        "as_prob": "AS Probability (Monte Carlo)",
        "waiting_simulation": "Awaiting Execution",
        "waiting_simulation_desc": "Configure the consequence variation limits and click \"Run Simulation\" to calculate and visualize results.",
        "decomposition_elicitation": "Decomposition Elicitation",
        "decomposition_desc": "Compare the two hypothetical options below and choose the preferred one to add a weight constraint, or change the question.",
        "decomposition_active_prefs": "Active Decomposition Preferences:",
        "option_1": "Option 01",
        "option_2": "Option 02",
        "change_question": "Change Question",
        "no_more_questions": "No more decomposition questions available."
    },
    pt: {
        // Base / Navigation
        "logout": "Sair",
        "user": "Usuário",
        "back": "<< Voltar",
        "system_title": "Sistema de Decisão SPEAR",
        // Welcome
        "register_user": "Registrar usuário",
        "login": "Entrar",
        "warning_text": "⚠️ Aviso: Alertamos que esta versão inclui novos recursos. Se encontrar algum erro, envie um e-mail para: cdsid.ufpe@gmail.com",
        // Login / Register
        "email": "E-mail:",
        "password": "Senha:",
        "confirm_password": "Confirmar Senha:",
        "forgot_password": "Esqueceu a senha?",
        "enter": "Entrar",
        "register": "Registrar",
        "error_required": "E-mail e senha são obrigatórios.",
        "error_mismatch": "As senhas não coincidem.",
        "error_exists": "E-mail já cadastrado.",
        "error_invalid_login": "E-mail ou senha inválidos.",
        // Options
        "choose_option": "Por favor, escolha uma opção:",
        "register_new_problem": "Registrar novo problema",
        "continue_registered_issue": "Continuar problema registrado",
        // Continue
        "no_saved_problems": "Nenhum problema salvo encontrado. Por favor, registre um novo problema.",
        "wait_note": "*Pode levar alguns segundos, por favor aguarde.",
        "select": "Selecionar",
        "select_problem_first": "Por favor, selecione um problema primeiro.",
        // Setup
        "step1_title": "Passo 1: Parâmetros de Configuração",
        "problem_name": "Nome do Problema:",
        "num_crit": "Número de Critérios:",
        "num_alt": "Número de Alternativas:",
        "update_matrix": "Atualizar Tamanho da Matriz",
        "import_file": "Ou Importar Arquivo de Dados",
        "drag_drop": "Arraste e Solte o arquivo aqui ou procure",
        "supports": "Suporta .csv ou .xlsx",
        "step2_title": "Passo 2: Matriz de Consequências",
        "crit_types_info": "🛈 Info dos Tipos de Critério",
        "crit_types_guide": "Guia de Tipos de Critério:",
        "crit_type_cont_min": "Contínuo Mín",
        "crit_type_cont_max": "Contínuo Máx",
        "crit_type_disc_min": "Discreto Mín",
        "crit_type_disc_max": "Discreto Máx",
        "crit_type_int_min": "Inteiro Mín",
        "crit_type_int_max": "Inteiro Máx",
        "continuous_guide": "Mín/Máx Contínuo: Representa métricas contínuas (ex: custos ou peso).",
        "discrete_guide": "Mín/Máx Discreto: Representa níveis de qualidade ou desempenho. Requer níveis.",
        "integer_guide": "Mín/Máx Inteiro: Representa medições de contagem inteira.",
        "levels_discrete": "Níveis (Discreto)",
        "save_problem": "Salvar problema",
        "show_results": "Mostrar Resultados",
        "alt_crit_header": "Alternativas \\ Critérios",
        "type_header": "Tipo",
        "invalid_dimensions": "Dimensões inválidas",
        "imported_success": "Problema salvo com sucesso!",
        "load_error": "Erro ao carregar o problema: ",
        // Results
        "recalculating": "Recalculando resultados parciais...",
        "results": "Resultados",
        "export_json": "Exportar JSON",
        "export_pdf": "Exportar PDF",
        "tab_additive": "Resultados Aditivos (ROC)",
        "tab_outranking": "Resultados de Sobreclassificação (PROMETHEE)",
        "tab_rules": "Regras de Decisão",
        "tab_filters": "Elicitação Interativa",
        "tab_distributions": "Distribuições de Valores Globais",
        "subtab_freq": "Frequências & Gráfico",
        "subtab_stats": "Estatísticas de Simulação",
        "subtab_elicitation": "Análise de Elicitação",
        "freq_solutions": "Frequência de Soluções",
        "alt_results": "Resultados das Alternativas",
        "alt_sol_header": "Alternativa / Solução",
        "freq_header": "Frequência",
        "avg_std_dev": "Média & Desvio Padrão",
        "max_min": "Máx & Mín (Dmax / Dmin)",
        "impact_crit": "Impacto das Preferências de Critérios",
        "prob_x": "Probabilidade de X",
        "prob_z": "Probabilidade de Z",
        "prob_others": "Probabilidade de Outros",
        "roc_rec": "Recomendação ROC",
        "promethee_rec": "Recomendação PROMETHEE",
        "crit_rank_filters": "Ordenação dos Critérios",
        "any_criterion": "Qualquer Critério",
        "matching_perms": "Permutações Correspondentes:",
        "reset_filters": "Limpar Preferências",
        "prob_analysis": "Análise de Probabilidade das Alternativas",
        "prob_comparison": "Comparação de Probabilidade",
        "prob_being_sol": "Probabilidade de Ser uma Solução",
        "original_prob": "Prob Original",
        "filtered_prob": "Prob Filtrada",
        "difference": "Diferença",
        "global_val_dist": "Distribuição de Valores Globais sob Preferências",
        "filters_none": "Preferências: Nenhuma",
        "filters_badge_prefix": "Preferências: ",
        "val_profile_curve": "Curva de Perfil de Valor",
        "range_bar_chart": "Gráfico de Intervalo (Barra)",
        "holistic_evals": "Avaliação Holística",
        "holistic_desc": "Defina preferências globais entre alternativas (ex: A ≥ B). Apenas alternativas com probabilidade de solução maior que zero são exibidas. Clique em uma linha de preferência para selecioná-la e comparar consequências.",
        "add_preference": "+ Adicionar Preferência",
        "apply_holistic": "Aplicar Preferências Holísticas",
        "clear_all": "Limpar Tudo",
        "conseq_comparison": "Comparação de Consequências",
        "conseq_placeholder": "Selecione uma preferência holística à esquerda (ou adicione uma e clique no ícone de gráfico correspondente) para comparar as consequências.",
        "comparing_alts": "Comparando Alt A vs Alt B",
        "display_alts": "Exibir Alternativas (apenas as que foram solução ao menos uma vez)",
        "global_val_stats": "Estatísticas de Valores Globais",
        "global_val_chart": "Gráfico de Distribuição de Valor Global",
        "min": "Mín",
        "avg": "Média (μ)",
        "max": "Máx",
        "std": "Desvio Padrão (σ)",
        "alternative": "Alternativa",
        "original_prob_col": "Prob Original",
        "filtered_prob_col": "Prob Filtrada",
        "difference_col": "Diferença",
        "crit_col": "Critério",
        "type_col": "Tipo",
        "diff_col": "Diferença",
        "better_col": "Melhor",
        "tie": "Empate",
        "comparing_alts_prefix": "Comparando: ",
        "no_compat_order": "Nenhuma ordem de critérios compatível encontrada.",
        "select_alt_display": "Selecione pelo menos uma alternativa para exibir.",
        "no_solved_alts": "Nenhuma alternativa resolvida sob os filtros atuais.",
        "conflict_filter": "Conflito: O mesmo critério não pode ser selecionado para múltiplas posições.",
        "conflict_holistic": "Erro: Uma alternativa não pode ser comparada com ela mesma.",
        "loading_problem": "⏳ Carregando dados do problema...",
        "running": "Executando...",
        "save_success": "Problema salvo com sucesso!",
        // Extra dynamic strings added for charts/alerts
        "normalized_perf": "Desempenho Normalizado [0, 1]",
        "prob_pct": "Probabilidade (%)",
        "dist_roc_title": "Distribuição de Valores Globais (ROC)",
        "dist_prom_title": "Distribuição de Fluxos de Sobreclassificação Líquidos (PROMETHEE)",
        "utility": "Valor Global",
        "net_flow": "Fluxo Líquido",
        "percentile_perms": "Percentil de Permutações (%)",
        "val_range": "Intervalo de Valores [Mín, Máx]",
        "import_error_prefix": "Erro de importação: ",
        "import_fail": "Falha ao importar o arquivo.",
        "no_results_found": "Nenhum resultado encontrado. Por favor, execute uma simulação primeiro.",
        "no_results_export": "Nenhum resultado para exportar.",
        "pdf_gen_fail_prefix": "Falha ao gerar relatório PDF: ",
        "save_error_prefix": "Erro ao salvar o problema: ",
        "save_fail": "Falha ao salvar o problema.",
        "problem_not_found": "Problema não encontrado ou você não tem permissão para acessá-lo.",
        "load_error_prefix": "Erro ao carregar o problema: ",
        "load_fail": "Falha ao carregar o problema selecionado. Verifique o console para detalhes.",
        "error_prefix": "Erro: ",
        "network_error": "Erro de Rede",
        "saved_on_prefix": "Salvo em: ",
        "at_pos": "em",
        "position_label": "Posição",
        "rationality": "Racionalidade:",
        "compensatory": "Compensatória",
        "non_compensatory": "Não compensatória",
        "partial_results": "Resultados Parciais",
        "final_results": "Resultados Finais",
        "elicitation": "Elicitação",
        "criteria_ordering": "Ordenação dos Critérios",
        "holistic_evaluation": "Avaliação Holística",
        "global_value_analysis": "Análise do Valor Global",
        "concluded_success": "Elicitação concluída com sucesso! Uma única solução final foi encontrada:",
        "restart_elicitation": "Reiniciar Elicitação",
        "winning_solution": "Solução Vencedora:",
        "active_preferences": "Preferências Ativas:",
        "applied_filters": "Preferências Aplicadas:",
        "winner_consequences": "Consequências da Alternativa Vencedora",
        "winner_global_value_range": "Intervalo de Valor Global da Vencedora",
        "winner_net_flow_range": "Intervalo de Fluxo Líquido da Vencedora",
        "criteria_weights_range": "Intervalos de Peso dos Critérios",
        "direction_col": "Direção de Preferência",
        "value_col": "Valor",
        "crit_type_continuous": "Contínuo",
        "crit_type_discrete": "Discreto",
        "crit_type_integer": "Inteiro",
        "crit_dir_min": "Minimização",
        "crit_dir_max": "Maximização",
        "global_val_range": "Intervalo de Valor Global [Mín, Máx]",
        "weight_range": "Intervalo de Peso [Mín, Máx]",
        "loss_average_title": "Perda Média quando Não é Solução",
        "loss_limits_title": "Limites de Perda quando Não é Solução (Dmax / Dmin)",
        "loss_average_desc": "Calcula a perda média (diferença de valor global em relação à alternativa vencedora) nos casos simulados em que a alternativa não foi a solução escolhida.",
        "loss_limits_desc": "Calcula as perdas máximas e mínimas nos casos simulados em que a alternativa não foi a solução escolhida.",
        "average_loss": "Perda Média",
        "max_loss": "Perda Máxima",
        "min_loss": "Perda Mínima",
        "swing_title": "Visualização dos Critérios (Procedimento SWING)",
        "select_alt_view": "Selecione uma Alternativa para Visualizar:",
        "run_sensitivity": "Análise de Sensibilidade",
        "sensitivity_analysis_title": "Análise de Sensibilidade (Simulação de Monte Carlo)",
        "sensitivity_desc": "Defina as porcentagens de variação das consequências (relativo à amplitude de cada critério). O sistema executará 10.000 simulações de Monte Carlo para avaliar a probabilidade de cada alternativa ser a vencedora sob incerteza.",
        "as_parameters": "Configuração de Parâmetros",
        "set_all_variations": "Variação Global (aplicar a todos):",
        "apply": "Aplicar",
        "back_to_results": "Voltar aos Resultados",
        "run_analysis": "Executar Simulação",
        "as_results": "Resultados da Simulação",
        "prob_winning_chart": "Probabilidade de Sucesso (%)",
        "original_best_prob": "Freq. Original (Permutações)",
        "as_prob": "Probabilidade AS (Monte Carlo)",
        "waiting_simulation": "Aguardando Execução",
        "waiting_simulation_desc": "Configure os limites de variação das consequências e clique em \"Executar Simulação\" para calcular e visualizar os resultados.",
        "decomposition_elicitation": "Elicitação por Decomposição",
        "decomposition_desc": "Compare as duas opções hipotéticas abaixo e escolha a preferida para adicionar uma restrição de pesos, ou mude a pergunta.",
        "decomposition_active_prefs": "Preferências de Decomposição Ativas:",
        "option_1": "Opção 01",
        "option_2": "Opção 02",
        "change_question": "Mudar Pergunta",
        "no_more_questions": "Não há mais perguntas de decomposição disponíveis."
    }
};

function translateDOM() {
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    
    // Translate text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
                el.value = dict[key];
            } else {
                el.textContent = dict[key];
            }
        }
    });

    // Translate placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            el.placeholder = dict[key];
        }
    });

    // Translate specific input initial values
    document.querySelectorAll('[data-i18n-value]').forEach(el => {
        const key = el.getAttribute('data-i18n-value');
        if (dict[key] && el.value === el.defaultValue) {
            el.value = dict[key];
            el.defaultValue = dict[key];
        }
    });

    // Translate dynamic continue options text (Saved on / Salvo em)
    const problemSelect = document.getElementById('problemSelect');
    if (problemSelect) {
        const options = problemSelect.querySelectorAll('.problem-option');
        options.forEach(opt => {
            if (opt.textContent.includes('Saved on:')) {
                if (lang === 'pt') {
                    opt.textContent = opt.textContent.replace('Saved on:', 'Salvo em:');
                }
            } else if (opt.textContent.includes('Salvo em:')) {
                if (lang === 'en') {
                    opt.textContent = opt.textContent.replace('Salvo em:', 'Saved on:');
                }
            }
        });
    }

    // Translate table headers in setup matrix if they exist
    const table = document.getElementById('matrixTable');
    if (table) {
        const trs = table.querySelectorAll('tr');
        if (trs.length >= 3) {
            const firstTh = trs[0].querySelector('th');
            if (firstTh) firstTh.textContent = dict.alt_crit_header;
            
            const typeTd = trs[1].querySelector('td');
            if (typeTd) typeTd.innerHTML = `<strong>${dict.type_header}</strong>`;
            
            const levelsTd = trs[2].querySelector('td');
            if (levelsTd) levelsTd.innerHTML = `<strong>${dict.levels_discrete}</strong>`;
            
            trs[1].querySelectorAll('.crit-type').forEach(select => {
                const val = select.value;
                select.innerHTML = `
                    <option value="0">${dict.crit_type_cont_min}</option>
                    <option value="1">${dict.crit_type_cont_max}</option>
                    <option value="2">${dict.crit_type_disc_min}</option>
                    <option value="3">${dict.crit_type_disc_max}</option>
                    <option value="4">${dict.crit_type_int_min}</option>
                    <option value="5">${dict.crit_type_int_max}</option>
                `;
                select.value = val;
            });
        }
    }

    // Update document title
    if (dict.system_title) {
        document.title = dict.system_title;
    }
    
    // Update subtab title details if on results
    const elicitationSubtitle = document.getElementById('elicitationSubtitle');
    if (elicitationSubtitle && currentResultsData) {
        const data = currentResultsData.elicitation;
        const altXName = data.altX !== -1 ? currentResultsData.nomesAlt[data.altX] : (lang === 'pt' ? 'Nenhuma' : 'None');
        const altZName = data.altZ !== -1 ? currentResultsData.nomesAlt[data.altZ] : (lang === 'pt' ? 'Nenhuma' : 'None');
        elicitationSubtitle.textContent = `X = ${altXName}, Z = ${altZName}`;
    }
}

function initializeLanguage() {
    let lang = localStorage.getItem('spear_lang');
    if (!lang) {
        lang = 'en'; // default to English
        localStorage.setItem('spear_lang', lang);
    }
    updateLanguageUI(lang);
    translateDOM();
}

function updateLanguageUI(lang) {
    const langIcon = document.getElementById('langIcon');
    if (langIcon) {
        langIcon.textContent = lang === 'pt' ? '🇧🇷' : '🇺🇸';
    }
}

function toggleLanguage() {
    let lang = localStorage.getItem('spear_lang') || 'en';
    lang = lang === 'en' ? 'pt' : 'en';
    localStorage.setItem('spear_lang', lang);
    updateLanguageUI(lang);
    translateDOM();
    
    // Re-render results if we are on results page to localize charts and tables
    if (currentResultsData && typeof renderResults === 'function') {
        const activePanel = document.querySelector('.tab-panel.active');
        const wasSensitivityActive = activePanel && activePanel.id === 'tabSensitivity';

        // Clear charts first
        if (rocChart) { rocChart.destroy(); rocChart = null; }
        if (prometheeChart) { prometheeChart.destroy(); prometheeChart = null; }
        if (filterChartInstance) { filterChartInstance.destroy(); filterChartInstance = null; }
        if (distChartInstance) { distChartInstance.destroy(); distChartInstance = null; }
        if (consequenceChartInstance) { consequenceChartInstance.destroy(); consequenceChartInstance = null; }
        if (asChartInstance) { asChartInstance.destroy(); asChartInstance = null; }
        
        renderResults(currentResultsData);
        
        // If sensitivity was active, force restore it and refresh in the new language
        if (wasSensitivityActive) {
            const finalTabBtn = document.getElementById('tabFinalResultsBtn');
            const partialTabBtn = document.getElementById('tabPartialResultsBtn');
            const elicitationTabBtn = document.getElementById('tabElicitationBtn');
            if (finalTabBtn) finalTabBtn.style.display = 'none';
            if (partialTabBtn) partialTabBtn.style.display = 'none';
            if (elicitationTabBtn) elicitationTabBtn.style.display = 'none';
            openTab(null, 'tabSensitivity');
            setupASInputScreen();
            if (lastASResult) {
                renderASResults(lastASResult);
            }
        }
    }
}

// --- Theme Management ---
function initializeTheme() {
    let theme = localStorage.getItem('spear_theme');
    if (!theme) {
        theme = 'light';
        localStorage.setItem('spear_theme', theme);
    }
    updateThemeUI(theme);
}

function updateThemeUI(theme) {
    const themeIcon = document.getElementById('themeIcon');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
    } else {
        document.body.classList.remove('dark-theme');
        if (themeIcon) themeIcon.textContent = '☀️';
    }
}

function toggleTheme() {
    let theme = localStorage.getItem('spear_theme') || 'light';
    theme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('spear_theme', theme);
    updateThemeUI(theme);
}

// Tab Navigation
function openTab(evt, tabName) {
    const tabPanels = document.getElementsByClassName("tab-panel");
    for (let i = 0; i < tabPanels.length; i++) {
        tabPanels[i].classList.remove("active");
    }
    
    const tabLinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove("active");
    }
    
    const target = document.getElementById(tabName);
    if(target) target.classList.add("active");
    if(evt) evt.currentTarget.classList.add("active");
}

function openSubTab(evt, subTabId) {
    const parentPanel = evt.currentTarget.closest('.tab-panel');
    if (!parentPanel) return;
    
    const subPanels = parentPanel.getElementsByClassName("subtab-panel");
    for (let i = 0; i < subPanels.length; i++) {
        subPanels[i].classList.remove("active");
    }
    
    const subLinks = parentPanel.getElementsByClassName("subtab-link");
    for (let i = 0; i < subLinks.length; i++) {
        subLinks[i].classList.remove("active");
    }
    
    const target = document.getElementById(subTabId);
    if(target) target.classList.add("active");
    if(evt) evt.currentTarget.classList.add("active");
    
    // Special handling for Decomposition chart refresh when tab becomes visible
    if (subTabId === 'subTabDecomposition') {
        if (currentResultsData && currentResultsData.decompositionQuestion) {
            const q = currentResultsData.decompositionQuestion;
            renderDecompositionComparison(q.critAIdx, q.critBIdx, q.ratio);
        } else {
            clearDecompositionChart();
        }
    }
}


// Ensure chart instance tracking to destroy before recreate
let rocChart = null;
let prometheeChart = null;
let filterChartInstance = null;
let distChartInstance = null;
let originalResultsData = null;
let currentResultsData = null;
let activeFilters = [];
let activeHolisticFilters = []; // [{alt1Idx, relation, alt2Idx}] applied in filters tab
let activeFilterModel = 'roc';
let activeDistModel = 'roc';
let activeDistType = 'curve';
let activeConsequenceView = 'bar';
let selectedHolisticRowId = null;
let consequenceChartInstance = null;
let finalGlobalValueChartInstance = null;
let finalCriteriaWeightsChartInstance = null;
let swingChartInstance = null;
let asChartInstance = null;
let lastASResult = null;
let activeDecompositionPreferences = [];
let excludedDecompositionPairs = [];
let activeDecompositionView = 'bar';
let decompositionChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Theme and Language
    initializeTheme();
    initializeLanguage();
    
    // Add Event Listeners for Toggles
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
        langBtn.addEventListener('click', toggleLanguage);
    }
    
    // ----------- SETUP PAGE LOGIC -----------
    const btnGenerate = document.getElementById('btnGenerateGrid');
    if (btnGenerate) {
        btnGenerate.addEventListener('click', () => {
            const numCrit = parseInt(document.getElementById('numCrit').value);
            const numAlt = parseInt(document.getElementById('numAlt').value);
            
            if (numCrit < 1 || numAlt < 2) return alert('Invalid dimensions');
            
            generateMatrix(numAlt, numCrit);
        });
        
        document.getElementById('btnSolve').addEventListener('click', solveProblem);
        
        const btnSave = document.getElementById('btnSaveProblem');
        if (btnSave) {
            btnSave.addEventListener('click', async () => {
                const savedId = await saveProblemAction();
                if (savedId) {
                    alert('Problem saved successfully!');
                }
            });
        }

        // Check if there is a problem to load from continue.html or query parameters
        const urlParams = new URLSearchParams(window.location.search);
        let loadProblemId = urlParams.get('problem_id');
        if (!loadProblemId) {
            loadProblemId = localStorage.getItem('spear_load_problem_id');
            if (loadProblemId) {
                localStorage.removeItem('spear_load_problem_id');
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?problem_id=' + loadProblemId;
                window.history.replaceState({ path: newUrl }, '', newUrl);
            }
        }
        
        if (window.loadedProblemData) {
            loadProblemFromData(window.loadedProblemData);
        } else if (loadProblemId) {
            await loadProblem(loadProblemId);
        } else {
            // Generate default matrix
            generateMatrix(4, 3);
        }
        
        // Import Data Dropzone handling
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('fileInput');
        
        if (dropzone && fileInput) {
            // Click triggers hidden input click
            dropzone.addEventListener('click', () => fileInput.click());
            
            // Drag and drop highlights
            ['dragenter', 'dragover'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.add('dragover');
                }, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.remove('dragover');
                }, false);
            });
            
            dropzone.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                const files = dt.files;
                if (files.length) {
                    fileInput.files = files;
                    handleFileImport(files[0]);
                }
            });
            
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length) {
                    handleFileImport(fileInput.files[0]);
                }
            });
        }
        
        async function handleFileImport(file) {
            const lang = localStorage.getItem('spear_lang') || 'en';
            const dict = translations[lang] || translations.en;
            const formData = new FormData();
            formData.append('file', file);
            
            const filenameEl = document.getElementById('dropzoneFilename');
            if (filenameEl) {
                filenameEl.textContent = `Imported: ${file.name}`;
                filenameEl.style.display = 'inline-block';
            }
            
            try {
                const res = await fetch('/api/import', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (!data.success) {
                    alert((dict.import_error_prefix || 'Import error: ') + data.error);
                    if (filenameEl) filenameEl.style.display = 'none';
                    return;
                }
                const matrix = data.matrix;
                const criteria = data.criteria || [];
                const criterionTypes = data.criterionTypes || [];
                const levels = data.levels || [];
                const numAlt = matrix.length;
                const numCrit = criteria.length;
                
                document.getElementById('numAlt').value = numAlt;
                document.getElementById('numCrit').value = numCrit;
                
                generateMatrix(numAlt, numCrit);
                
                // Fill criteria names
                const critNameInputs = document.querySelectorAll('.crit-name');
                critNameInputs.forEach((inp, idx) => {
                    if (criteria[idx] !== undefined) inp.value = criteria[idx];
                });
                
                // Fill criteria types and levels
                const typeSelects = document.querySelectorAll('.crit-type');
                const levelInputs = document.querySelectorAll('.crit-niveis');
                typeSelects.forEach((select, idx) => {
                    const typeVal = criterionTypes[idx] !== undefined ? criterionTypes[idx] : 0;
                    select.value = typeVal;
                    toggleNiveis(select, idx);
                });
                levelInputs.forEach((inp, idx) => {
                    const ct = criterionTypes[idx];
                    if (ct === 2 || ct === 3) {
                        inp.value = levels[idx] !== undefined ? levels[idx] : '';
                    } else {
                        inp.value = '';
                    }
                });
                
                // Fill alternative names
                const altImportInputs = document.querySelectorAll('.alt-name');
                altImportInputs.forEach((inp, idx) => {
                    if (data.alternatives && data.alternatives[idx] !== undefined) {
                        inp.value = data.alternatives[idx];
                    }
                });
                
                // Fill consequence matrix values
                const inputs = document.querySelectorAll('.conseq-val');
                inputs.forEach((inp, idx) => {
                    const row = Math.floor(idx / numCrit);
                    const col = idx % numCrit;
                    const val = parseFloat(matrix[row][col]);
                    inp.value = isNaN(val) ? '' : val;
                });
                
                // Update holistic dropdowns with new alternative names
                updateHolisticDropdowns();
            } catch (e) {
                console.error(e);
                alert(dict.import_fail || 'Failed to import file.');
                if (filenameEl) filenameEl.style.display = 'none';
            }
        }
        
        // Matrix hover cell/row/col highlighting setup
        const table = document.getElementById('matrixTable');
        if (table) {
            table.addEventListener('mouseover', (e) => {
                const target = e.target;
                if (target && target.classList.contains('conseq-val')) {
                    const rowIdx = parseInt(target.getAttribute('data-row'));
                    const colIdx = parseInt(target.getAttribute('data-col'));
                    highlightMatrixGrid(rowIdx, colIdx, true);
                }
            });
            table.addEventListener('mouseout', (e) => {
                const target = e.target;
                if (target && target.classList.contains('conseq-val')) {
                    const rowIdx = parseInt(target.getAttribute('data-row'));
                    const colIdx = parseInt(target.getAttribute('data-col'));
                    highlightMatrixGrid(rowIdx, colIdx, false);
                }
            });
        }
    }
    
    // ----------- RESULTS PAGE LOGIC -----------
    const resProblemName = document.getElementById('resProblemName');
    if (resProblemName) {
        const resultsData = JSON.parse(sessionStorage.getItem('spearResults'));
        if (!resultsData) {
            const lang = localStorage.getItem('spear_lang') || 'en';
            const dict = translations[lang] || translations.en;
            alert(dict.no_results_found || 'No results found. Please run a simulation first.');
            if (window.delphiTriggerId) {
                window.location.href = '/';
            } else {
                window.location.href = '/setup';
            }
            return;
        }
        
        originalResultsData = resultsData;
        currentResultsData = resultsData;
        activeFilters = Array(resultsData.nomesCrit.length).fill(null);
        if (resultsData.holisticEvaluations) {
            activeHolisticFilters = resultsData.holisticEvaluations.map(ev => {
                const alt1Idx = resultsData.nomesAlt.indexOf(ev.alt1);
                let alt2Idx;
                if (ev.alt2 === 'fictitious') {
                    alt2Idx = 'fictitious';
                } else {
                    alt2Idx = resultsData.nomesAlt.indexOf(ev.alt2);
                }
                return { alt1Idx, relation: ev.relation, alt2Idx, fictitiousValue: ev.fictitiousValue };
            }).filter(f => f.alt1Idx !== -1 && f.alt2Idx !== -1);
        } else {
            activeHolisticFilters = [];
        }
        
        if (resultsData.decompositionPreferences) {
            activeDecompositionPreferences = resultsData.decompositionPreferences.map(dp => {
                return { critA: dp.critA, critB: dp.critB, relation: dp.relation, ratio: dp.ratio };
            });
        } else {
            activeDecompositionPreferences = [];
        }
        excludedDecompositionPairs = [];
        
        resProblemName.textContent = `Results: ${resultsData.problemName}`;
        
        const backBtn = document.querySelector('.back-link');
        if (backBtn && resultsData && resultsData.problemId) {
            backBtn.href = `/setup?problem_id=${resultsData.problemId}`;
        }
        renderResults(resultsData);
    }
        // Export JSON button handler
        const exportBtn = document.getElementById('btnExport');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const data = sessionStorage.getItem('spearResults');
                if (!data) {
                    const lang = localStorage.getItem('spear_lang') || 'en';
                    const dict = translations[lang] || translations.en;
                    alert(dict.no_results_export || 'No results to export.');
                    return;
                }
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'spear_results.json';
                a.click();
                URL.revokeObjectURL(url);
            });
        }
        // Export PDF button handler
        const exportPdfBtn = document.getElementById('btnExportPDF');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => {
                const data = JSON.parse(sessionStorage.getItem('spearResults'));
                const lang = localStorage.getItem('spear_lang') || 'en';
                const dict = translations[lang] || translations.en;
                if (!data) { alert(dict.no_results_found || 'Nenhum resultado encontrado.'); return; }
                try {
                    generatePDFReport(data);
                } catch (e) {
                    console.error('PDF export error:', e);
                    alert((dict.pdf_gen_fail_prefix || 'Falha ao gerar relatório PDF: ') + e.message);
                }
            });
        }
});

function generatePDFReport(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const lang = localStorage.getItem('spear_lang') || 'en';
    const isPt = lang === 'pt';
    const rationality = data.rationality || 'compensatory';
    
    const labelTitle = isPt ? 'Relatório do Sistema de Decisão SPEAR' : 'SPEAR Decision System Report';
    const labelProblemName = isPt ? 'Nome do Problema' : 'Problem Name';
    const labelTotalCases = isPt ? 'Total de Casos Simulados' : 'Total Simulated Cases';
    const labelDateGen = isPt ? 'Data de Geração' : 'Date of Generation';
    const labelRecSummary = isPt ? 'Resumo de Recomendações' : 'Recommendations Summary';
    const labelMethod = isPt ? 'Método' : 'Method';
    const labelStatus = isPt ? 'Status' : 'Status';
    const labelRecAlts = isPt ? 'Alternativas Recomendadas' : 'Recommended Alternatives';
    const labelDetails = isPt ? 'Detalhes' : 'Details';
    const labelSolution = isPt ? 'Solução' : 'Solution';
    const labelFreq = isPt ? 'Freq' : 'Freq';
    const labelRocResults = isPt ? '1. Resultados do ROC Surrogate' : '1. ROC Surrogate Results';
    const labelPromResults = isPt ? '1. Resultados do PROMETHEE' : '1. PROMETHEE Results';
    const labelChartNotRendered = isPt ? 'Gráfico não renderizado' : 'Chart not rendered';
    const labelOpenTab = isPt ? '(Abra a aba para carregar)' : '(Open tab to load)';
    const labelSimStats = isPt ? '2. Estatísticas de Simulação' : '2. Simulation Statistics';
    const labelRocStats = isPt ? 'Estatísticas do ROC Surrogate' : 'ROC Surrogate Statistics';
    const labelPromStats = isPt ? 'Estatísticas do PROMETHEE' : 'PROMETHEE Statistics';
    const labelAverage = isPt ? 'Média (μ)' : 'Average (μ)';
    const labelStdDev = isPt ? 'Desvio Padrão (σ)' : 'Std Dev (σ)';
    const labelMax = isPt ? 'Máx (Dmax)' : 'Max (Dmax)';
    const labelMin = isPt ? 'Mín (Dmin)' : 'Min (Dmin)';
    const labelPercentage = isPt ? 'Percentual' : 'Percentage';
    const labelElicitAnalysis = isPt ? '3. Análise de Elicitação (ROC)' : '3. Elicitation Analysis (ROC)';
    const labelPrefImpact = isPt ? 'Impacto das Preferências' : 'Preferences Impact';
    const labelProbX = isPt ? 'Probabilidade de X' : 'Probability of X';
    const labelProbZ = isPt ? 'Probabilidade de Z' : 'Probability of Z';
    const labelProbOthers = isPt ? 'Probabilidade de Outros' : 'Probability of Others';
    const labelPage = isPt ? 'Página' : 'Page';
    const labelOf = isPt ? 'de' : 'of';
    const labelReportTitleShort = isPt ? 'Relatório SPEAR' : 'SPEAR Decision System Report';
    const labelProblemShort = isPt ? 'Problema' : 'Problem';
    const labelGeneratedOn = isPt ? 'Gerado em' : 'Generated on';
    const labelNone = isPt ? 'Nenhuma' : 'None';
    
    // Page margins and sizing
    const margin = 14;
    const pageWidth = 210;
    const pageHeight = 297;
    
    let currentY = 25;
    
    const totalCasesRoc = data.roc?.totalCases || data.totalCases || 0;
    const totalCasesPromethee = data.promethee?.totalCases || data.totalCases || 0;
    const totalCases = rationality === 'compensatory' ? totalCasesRoc : totalCasesPromethee;
    
    // Helper to get recommendation text
    const getRecommendedAltsText = (ruleData, nomesAlt) => {
        if (ruleData && ruleData.recommended_alts && ruleData.recommended_alts.length > 0) {
            return ruleData.recommended_alts.map(i => nomesAlt[i] || `A${i+1}`).join(', ');
        }
        return '-';
    };

    // Helper to extract chart image safely (handles unrendered charts or hidden tabs)
    const getChartImage = (chartInstance) => {
        try {
            if (!chartInstance) return null;
            const img = chartInstance.toBase64Image();
            if (img && img.startsWith('data:image/png;base64,') && img.length > 1000) {
                return img;
            }
        } catch (e) {
            console.warn('Could not extract chart image:', e);
        }
        return null;
    };
    
    // ---------------- PAGE 1: TITLE & SUMMARY ----------------
    // Document Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); // Dark blue
    doc.text(labelTitle, margin, currentY);
    currentY += 8;
    
    // Sub-header/Meta info
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99); // Dark gray
    doc.text(`${labelProblemName}: ${data.problemName || 'N/A'}`, margin, currentY);
    currentY += 5;
    
    const ratLabel = isPt ? 'Racionalidade' : 'Rationality';
    const ratVal = rationality === 'compensatory' ? (isPt ? 'Compensatória' : 'Compensatory') : (isPt ? 'Não compensatória' : 'Non-compensatory');
    doc.text(`${ratLabel}: ${ratVal} | ${labelTotalCases}: ${totalCases}`, margin, currentY);
    currentY += 5;
    doc.text(`${labelDateGen}: ${new Date().toLocaleString()}`, margin, currentY);
    currentY += 6;
    
    // Divider line
    doc.setDrawColor(59, 130, 246); // Primary blue
    doc.setLineWidth(0.8);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // List of active filters
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    
    const labelFiltersTitle = isPt ? 'Preferências de Elicitação Aplicadas:' : 'Applied Elicitation Preferences:';
    doc.text(labelFiltersTitle, margin, currentY);
    currentY += 5;
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    let filterTextParts = [];
    for (let p = 0; p < activeFilters.length; p++) {
        const critIdx = activeFilters[p];
        if (critIdx !== null) {
            const critName = data.nomesCrit[critIdx];
            const ord = getOrdinalSuffix(p + 1);
            filterTextParts.push(`${critName} ${isPt ? 'em' : 'at'} ${ord}`);
        }
    }
    
    let holisticTextParts = [];
    activeHolisticFilters.forEach(hf => {
        const alt1Name = data.nomesAlt[hf.alt1Idx];
        const alt2Name = data.nomesAlt[hf.alt2Idx];
        const rel = hf.relation === '>=' ? '≥' : '≤';
        holisticTextParts.push(`${alt1Name} ${rel} ${alt2Name}`);
    });
    
    let filterLine = (isPt ? 'Ordenação: ' : 'Ordering: ') + (filterTextParts.length > 0 ? filterTextParts.join(', ') : (isPt ? 'Nenhuma' : 'None'));
    doc.text(filterLine, margin, currentY);
    currentY += 4;
    
    let holisticLine = (isPt ? 'Preferências Holísticas: ' : 'Holistic Preferences: ') + (holisticTextParts.length > 0 ? holisticTextParts.join(', ') : (isPt ? 'Nenhuma' : 'None'));
    doc.text(holisticLine, margin, currentY);
    currentY += 8;
    
    // Section: Recommendations
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text(labelRecSummary, margin, currentY);
    currentY += 6;
    
    const recBody = [];
    if (rationality === 'compensatory') {
        recBody.push([
            'ROC Surrogate (Additive)',
            data.roc?.decisionRule?.status || 'N/A',
            getRecommendedAltsText(data.roc?.decisionRule, data.nomesAlt),
            `Prob: ${(data.roc?.decisionRule?.probability || 0).toFixed(2)}% | Level: ${data.roc?.decisionRule?.rule_level || 0}`
        ]);
    } else {
        recBody.push([
            'PROMETHEE (Outranking)',
            data.promethee?.decisionRule?.status || 'N/A',
            getRecommendedAltsText(data.promethee?.decisionRule, data.nomesAlt),
            `Prob: ${(data.promethee?.decisionRule?.probability || 0).toFixed(2)}% | Level: ${data.promethee?.decisionRule?.rule_level || 0}`
        ]);
    }
    
    doc.autoTable({
        startY: currentY,
        head: [[labelMethod, labelStatus, labelRecAlts, labelDetails]],
        body: recBody,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        margin: { left: margin, right: margin, top: 22, bottom: 20 }
    });
    
    currentY = doc.lastAutoTable.finalY + 12;
    
    // ---------------- SECTION 2: RESULTS ----------------
    if (rationality === 'compensatory') {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 138);
        doc.text(labelRocResults, margin, currentY);
        currentY += 6;
        
        const rocRows = [];
        if (data.roc && data.roc.resultSol) {
            const sumFreqsRoc = data.roc.resultSol.reduce((a, b) => a + b, 0);
            for (let i = 0; i < data.roc.resultSol.length; i++) {
                if (data.roc.resultSol[i] === 0) continue;
                const label = getSolutionLabel(data.roc.matrizSol[i], data.nomesAlt);
                const freq = data.roc.resultSol[i];
                const pct = sumFreqsRoc > 0 ? ((freq / sumFreqsRoc) * 100).toFixed(2) + '%' : '0.00%';
                rocRows.push([label, freq.toString(), pct]);
            }
        }
        
        const tableWidth = 88;
        doc.autoTable({
            startY: currentY,
            tableWidth: tableWidth,
            head: [[labelSolution, labelFreq, '%']],
            body: rocRows,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 8, cellPadding: 3 },
            margin: { left: margin, top: 22, bottom: 20 }
        });
        
        const rocChartImg = getChartImage(rocChart);
        if (rocChartImg) {
            doc.setFillColor(30, 41, 59);
            doc.roundedRect(110, currentY, 86, 50, 3, 3, 'F');
            doc.addImage(rocChartImg, 'PNG', 112, currentY + 2, 82, 46);
        } else {
            doc.setFillColor(243, 244, 246);
            doc.setDrawColor(209, 213, 219);
            doc.setLineWidth(0.3);
            doc.roundedRect(110, currentY, 86, 50, 3, 3, 'FD');
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(107, 114, 128);
            doc.text(labelChartNotRendered, 153, currentY + 22, { align: 'center' });
            doc.text(labelOpenTab, 153, currentY + 28, { align: 'center' });
        }
        
        currentY = Math.max(doc.lastAutoTable.finalY, currentY + 50) + 12;
    } else {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 138);
        doc.text(labelPromResults, margin, currentY);
        currentY += 6;
        
        const promRows = [];
        if (data.promethee && data.promethee.resultSol) {
            const sumFreqsProm = data.promethee.resultSol.reduce((a, b) => a + b, 0);
            for (let i = 0; i < data.promethee.resultSol.length; i++) {
                if (data.promethee.resultSol[i] === 0) continue;
                const label = getSolutionLabel(data.promethee.matrizSol[i], data.nomesAlt);
                const freq = data.promethee.resultSol[i];
                const pct = sumFreqsProm > 0 ? ((freq / sumFreqsProm) * 100).toFixed(2) + '%' : '0.00%';
                promRows.push([label, freq.toString(), pct]);
            }
        }
        
        const tableWidth = 88;
        doc.autoTable({
            startY: currentY,
            tableWidth: tableWidth,
            head: [[labelSolution, labelFreq, '%']],
            body: promRows,
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129] },
            styles: { fontSize: 8, cellPadding: 3 },
            margin: { left: margin, top: 22, bottom: 20 }
        });
        
        const prometheeChartImg = getChartImage(prometheeChart);
        if (prometheeChartImg) {
            doc.setFillColor(30, 41, 59);
            doc.roundedRect(110, currentY, 86, 50, 3, 3, 'F');
            doc.addImage(prometheeChartImg, 'PNG', 112, currentY + 2, 82, 46);
        } else {
            doc.setFillColor(243, 244, 246);
            doc.setDrawColor(209, 213, 219);
            doc.setLineWidth(0.3);
            doc.roundedRect(110, currentY, 86, 50, 3, 3, 'FD');
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(107, 114, 128);
            doc.text(labelChartNotRendered, 153, currentY + 22, { align: 'center' });
            doc.text(labelOpenTab, 153, currentY + 28, { align: 'center' });
        }
        
        currentY = Math.max(doc.lastAutoTable.finalY, currentY + 50) + 12;
    }
    
    // ---------------- SECTION 3: STATISTICS ----------------
    if (currentY > 180) {
        doc.addPage();
        currentY = 25;
    }
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text(labelSimStats, margin, currentY);
    currentY += 6;
    
    if (rationality === 'compensatory') {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(59, 130, 246);
        doc.text(labelRocStats, margin, currentY);
        currentY += 4;
        
        const rocStatsRows = [];
        if (data.roc && data.roc.stats) {
            const stats = data.roc.stats;
            const sumFreqsRoc = data.roc.resultSol.reduce((a, b) => a + b, 0);
            for (let i = 0; i < stats.media_geral.length; i++) {
                if (data.roc.resultSol[i] === 0) continue;
                const label = getSolutionLabel(data.roc.matrizSol[i], data.nomesAlt);
                const mu = stats.media_geral[i].toFixed(4);
                const sigma = stats.desvio_padrao_geral[i].toFixed(4);
                const maxVal = stats.maximo_geral[i].toFixed(4);
                const minVal = stats.minimo_geral[i] > 900000 ? 'N/A' : stats.minimo_geral[i].toFixed(4);
                const pct = sumFreqsRoc > 0 ? ((data.roc.resultSol[i] / sumFreqsRoc) * 100).toFixed(2) + '%' : '0.00%';
                rocStatsRows.push([label, mu, sigma, maxVal, minVal, pct]);
            }
        }
        
        doc.autoTable({
            startY: currentY,
            head: [[labelSolution, labelAverage, labelStdDev, labelMax, labelMin, labelPercentage]],
            body: rocStatsRows,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 8, cellPadding: 3 },
            margin: { left: margin, right: margin, top: 22, bottom: 20 }
        });
        
        currentY = doc.lastAutoTable.finalY + 12;
    } else {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(16, 185, 129);
        doc.text(labelPromStats, margin, currentY);
        currentY += 4;
        
        const promStatsRows = [];
        if (data.promethee && data.promethee.stats) {
            const stats = data.promethee.stats;
            const sumFreqsProm = data.promethee.resultSol.reduce((a, b) => a + b, 0);
            for (let i = 0; i < stats.media_geral.length; i++) {
                if (data.promethee.resultSol[i] === 0) continue;
                const label = getSolutionLabel(data.promethee.matrizSol[i], data.nomesAlt);
                const mu = stats.media_geral[i].toFixed(4);
                const sigma = stats.desvio_padrao_geral[i].toFixed(4);
                const maxVal = stats.maximo_geral[i].toFixed(4);
                const minVal = stats.minimo_geral[i] > 900000 ? 'N/A' : stats.minimo_geral[i].toFixed(4);
                const pct = sumFreqsProm > 0 ? ((data.promethee.resultSol[i] / sumFreqsProm) * 100).toFixed(2) + '%' : '0.00%';
                promStatsRows.push([label, mu, sigma, maxVal, minVal, pct]);
            }
        }
        
        doc.autoTable({
            startY: currentY,
            head: [[labelSolution, labelAverage, labelStdDev, labelMax, labelMin, labelPercentage]],
            body: promStatsRows,
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129] },
            styles: { fontSize: 8, cellPadding: 3 },
            margin: { left: margin, right: margin, top: 22, bottom: 20 }
        });
        
        currentY = doc.lastAutoTable.finalY + 12;
    }
    
    // ---------------- SECTION 4: ELICITATION ANALYSIS ----------------
    if (rationality === 'compensatory' && data.elicitation) {
        if (currentY > 180) {
            doc.addPage();
            currentY = 25;
        }
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 138);
        doc.text(labelElicitAnalysis, margin, currentY);
        currentY += 6;
        
        const altXName = data.elicitation.altX !== -1 ? (data.nomesAlt[data.elicitation.altX] || labelNone) : labelNone;
        const altZName = data.elicitation.altZ !== -1 ? (data.nomesAlt[data.elicitation.altZ] || labelNone) : labelNone;
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(75, 85, 99);
        doc.text(`${labelPrefImpact}: X = ${altXName}, Z = ${altZName}`, margin, currentY);
        currentY += 8;
        
        const getElicitTableData = (matrix, names) => {
            const head = [['C1 > C2', ...names]];
            const body = [];
            for (let i = 0; i < names.length; i++) {
                const row = [names[i]];
                for (let j = 0; j < names.length; j++) {
                    if (i === j) row.push('-');
                    else row.push((matrix[i][j] * 100).toFixed(1) + '%');
                }
                body.push(row);
            }
            return { head, body };
        };
        
        const tableX = getElicitTableData(data.elicitation.matrizProbX, data.nomesCrit);
        const tableZ = getElicitTableData(data.elicitation.matrizProbZ, data.nomesCrit);
        const tableOther = getElicitTableData(data.elicitation.matrizProbOutros, data.nomesCrit);
        
        // Table X
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(59, 130, 246);
        doc.text(labelProbX, margin, currentY);
        currentY += 4;
        
        doc.autoTable({
            startY: currentY,
            head: tableX.head,
            body: tableX.body,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 8, cellPadding: 2 },
            margin: { left: margin, right: margin, top: 22, bottom: 20 }
        });
        currentY = doc.lastAutoTable.finalY + 8;
        
        // Table Z
        if (currentY > 210) {
            doc.addPage();
            currentY = 25;
        }
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(59, 130, 246);
        doc.text(labelProbZ, margin, currentY);
        currentY += 4;
        
        doc.autoTable({
            startY: currentY,
            head: tableZ.head,
            body: tableZ.body,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 8, cellPadding: 2 },
            margin: { left: margin, right: margin, top: 22, bottom: 20 }
        });
        currentY = doc.lastAutoTable.finalY + 8;
        
        // Table Other
        if (currentY > 210) {
            doc.addPage();
            currentY = 25;
        }
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(59, 130, 246);
        doc.text(labelProbOthers, margin, currentY);
        currentY += 4;
        
        doc.autoTable({
            startY: currentY,
            head: tableOther.head,
            body: tableOther.body,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 8, cellPadding: 2 },
            margin: { left: margin, right: margin, top: 22, bottom: 20 }
        });
    }
    
    // ---------------- HEADER & FOOTER ON ALL PAGES ----------------
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Header
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175); // Light gray
        doc.text(labelReportTitleShort, margin, 10);
        doc.text(`${labelProblemShort}: ${data.problemName || 'N/A'}`, margin, 14);
        
        doc.setDrawColor(229, 231, 235); // Border gray
        doc.setLineWidth(0.2);
        doc.line(margin, 16, pageWidth - margin, 16);
        
        // Footer
        doc.line(margin, 282, pageWidth - margin, 282);
        doc.text(`${labelGeneratedOn}: ${new Date().toLocaleString()}`, margin, 288);
        doc.text(`${labelPage} ${i} ${labelOf} ${pageCount}`, pageWidth - margin, 288, { align: 'right' });
    }
    
    // Save report
    const sanitizedProbName = (data.problemName || 'report').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`spear_report_${sanitizedProbName}.pdf`);
}

function generateMatrix(numAlt, numCrit) {
    // Build full HTML as a single string for maximum performance
    let html = '<tbody>';
    
    // Header row with criteria names
    html += '<tr><th>Alternatives \\ Criteria</th>';
    for (let i = 0; i < numCrit; i++) {
        html += `<th><input type="text" class="crit-name" placeholder="Crit ${i+1}" value="C${i+1}"></th>`;
    }
    html += '</tr>';
    
    // Criteria type row
    html += '<tr><td><strong>Type</strong></td>';
    for (let i = 0; i < numCrit; i++) {
        html += `<td><select class="crit-type" onchange="toggleNiveis(this, ${i})">
            <option value="0">Continuous Min</option>
            <option value="1">Continuous Max</option>
            <option value="2">Discrete Min</option>
            <option value="3">Discrete Max</option>
            <option value="4">Integer Min</option>
            <option value="5">Integer Max</option>
        </select></td>`;
    }
    html += '</tr>';
    
    // Levels row
    html += '<tr><td><strong>Levels (Discrete)</strong></td>';
    for (let i = 0; i < numCrit; i++) {
        html += `<td><input type="number" class="crit-niveis" id="niveis-${i}" min="2" value="2" disabled></td>`;
    }
    html += '</tr>';
    
    // Alternative rows
    for (let j = 0; j < numAlt; j++) {
        html += `<tr><td><input type="text" class="alt-name" placeholder="Alt ${j+1}" value="A${j+1}"></td>`;
        for (let i = 0; i < numCrit; i++) {
            html += `<td><input type="number" step="any" class="conseq-val" data-row="${j}" data-col="${i}" value="0"></td>`;
        }
        html += '</tr>';
    }
    
    html += '</tbody>';
    
    const table = document.getElementById('matrixTable');
    if (table) {
        table.innerHTML = html;
    }
    updateHolisticDropdowns();
}

function toggleNiveis(selectElem, colIdx) {
    const val = parseInt(selectElem.value);
    const inputNiveis = document.getElementById(`niveis-${colIdx}`);
    if (val === 2 || val === 3) {
        inputNiveis.disabled = false;
    } else {
        inputNiveis.disabled = true;
    }
}

function getProblemDataPayload() {
    const problemId = document.getElementById('loadedProblemId').value;
    const problemName = document.getElementById('problemName').value;
    const numCrit = parseInt(document.getElementById('numCrit').value);
    const numAlt = parseInt(document.getElementById('numAlt').value);
    
    const criteria = Array.from(document.querySelectorAll('.crit-name')).map(i => i.value.trim());
    const criterionTypes = Array.from(document.querySelectorAll('.crit-type')).map(s => parseInt(s.value));
    const levels = criterionTypes.map((type, idx) => {
        if (type === 2 || type === 3) {
            const val = parseInt(document.getElementById(`niveis-${idx}`).value);
            return isNaN(val) ? 0 : val;
        }
        return 0;
    });
    const alternatives = Array.from(document.querySelectorAll('.alt-name')).map(i => i.value.trim());
    
    const rationalityEl = document.getElementById('problemRationality');
    const rationality = rationalityEl ? rationalityEl.value : 'compensatory';

    const matrix = [];
    for (let j = 0; j < numAlt; j++) {
        const row = [];
        for (let i = 0; i < numCrit; i++) {
            const input = document.querySelector(`.conseq-val[data-row="${j}"][data-col="${i}"]`);
            if (!input) return null;
            const val = parseFloat(input.value);
            row.push(isNaN(val) ? 0 : val);
        }
        matrix.push(row);
    }
    
    return {
        problemId: problemId ? parseInt(problemId) : null,
        problemName,
        rationality,
        numCrit,
        numAlt,
        criteria,
        criterionTypes,
        levels,
        alternatives,
        matrix,
        holisticEvaluations: (window.loadedHolisticEvaluations && window.loadedHolisticEvaluations.length > 0) ? window.loadedHolisticEvaluations : getHolisticEvaluationsPayload(),
        decompositionPreferences: (window.loadedDecompositionPreferences && window.loadedDecompositionPreferences.length > 0) ? window.loadedDecompositionPreferences : (typeof activeDecompositionPreferences !== 'undefined' ? activeDecompositionPreferences : [])
    };
}

async function saveProblemAction() {
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    // If running in Delphi context, delegate to the Delphi submit trigger
    if (window.delphiTriggerId && window.delphiProblemDataId && window.delphiActionTypeId) {
        const payload = getProblemDataPayload();
        if (!payload) return null;
        document.getElementById(window.delphiProblemDataId).value = JSON.stringify(payload);
        document.getElementById(window.delphiActionTypeId).value = 'save';
        document.getElementById(window.delphiTriggerId).click();
        return 'triggered';
    }
    
    const payload = getProblemDataPayload();
    if (!payload) return null;
    
    try {
        const res = await fetch('/api/save_problem', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('loadedProblemId').value = data.problemId;
            return data.problemId;
        } else {
            alert((dict.save_error_prefix || 'Error saving problem: ') + data.error);
        }
    } catch (err) {
        alert(dict.save_fail || 'Failed to save problem.');
    }
    return null;
}

async function loadProblem(problemId) {
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    
    // Show loading state on the setup card
    const setupMain = document.querySelector('.setup-main');
    const loadingMsg = document.createElement('div');
    loadingMsg.id = 'loadingMsg';
    loadingMsg.style.cssText = 'padding: 20px; text-align: center; font-size: 14px; color: var(--text-muted); font-weight: 500;';
    loadingMsg.textContent = dict.loading_problem || '⏳ Loading problem data...';
    if (setupMain) setupMain.prepend(loadingMsg);
    
    try {
        const res = await fetch(`/api/load_problem/${problemId}`);
        
        // Handle session expiry
        if (res.status === 401) {
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = '/login?next=' + currentUrl;
            return;
        }
        
        // Handle problem not found
        if (res.status === 404) {
            if (loadingMsg.parentNode) loadingMsg.remove();
            // Clear bad problem_id from URL
            const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
            alert(dict.problem_not_found || 'Problem not found or you do not have access to it.');
            generateMatrix(4, 3);
            return;
        }
        
        const data = await res.json();
        if (!data.success) {
            if (loadingMsg.parentNode) loadingMsg.remove();
            alert((dict.load_error_prefix || 'Error loading problem: ') + (data.error || 'Unknown error'));
            generateMatrix(4, 3);
            return;
        }
        
        window.loadedHolisticEvaluations = data.holisticEvaluations || [];
        window.loadedDecompositionPreferences = data.decompositionPreferences || [];
        
        // Validate essential fields
        const criteria = data.criteria || [];
        const criterionTypes = data.criterionTypes || [];
        const levels = data.levels || [];
        const alternatives = data.alternatives || [];
        const matrix = data.matrix || [];
        
        // Update basic info fields
        document.getElementById('loadedProblemId').value = data.problemId;
        document.getElementById('problemName').value = data.problemName || '';
        const rationalityEl = document.getElementById('problemRationality');
        if (rationalityEl) rationalityEl.value = data.rationality || 'compensatory';
        document.getElementById('numCrit').value = criteria.length;
        document.getElementById('numAlt').value = alternatives.length;
        
        // Generate the matrix DOM
        generateMatrix(alternatives.length, criteria.length);
        
        // Fill criteria names
        document.querySelectorAll('.crit-name').forEach((inp, idx) => {
            if (idx < criteria.length) inp.value = criteria[idx];
        });
        
        // Fill criteria types
        document.querySelectorAll('.crit-type').forEach((select, idx) => {
            if (idx < criterionTypes.length) {
                select.value = criterionTypes[idx];
                toggleNiveis(select, idx);
            }
        });
        
        // Fill discrete levels
        document.querySelectorAll('.crit-niveis').forEach((inp, idx) => {
            if (idx < levels.length) {
                inp.value = levels[idx] || '';
            }
        });
        
        // Fill alternatives names
        document.querySelectorAll('.alt-name').forEach((inp, idx) => {
            if (idx < alternatives.length) inp.value = alternatives[idx];
        });
        
        // Fill consequence values in batches using requestAnimationFrame to avoid freeze
        const conseqInputs = Array.from(document.querySelectorAll('.conseq-val'));
        const batchSize = 500;
        let batchIdx = 0;
        
        function fillBatch() {
            const end = Math.min(batchIdx + batchSize, conseqInputs.length);
            for (let i = batchIdx; i < end; i++) {
                const inp = conseqInputs[i];
                const row = parseInt(inp.getAttribute('data-row'));
                const col = parseInt(inp.getAttribute('data-col'));
                if (row < matrix.length && col < matrix[row].length) {
                    inp.value = matrix[row][col];
                }
            }
            batchIdx = end;
            if (batchIdx < conseqInputs.length) {
                requestAnimationFrame(fillBatch);
            } else {
                // All done — remove loading indicator
                if (loadingMsg.parentNode) loadingMsg.remove();
            }
        }
        requestAnimationFrame(fillBatch);
        
    } catch (err) {
        console.error('loadProblem error:', err);
        const msg = document.getElementById('loadingMsg');
        if (msg) msg.remove();
        alert(dict.load_fail || 'Failed to load the selected problem. Check the console for details.');
        generateMatrix(4, 3);
    }
}

function loadProblemFromData(data) {
    window.loadedHolisticEvaluations = data.holisticEvaluations || [];
    window.loadedDecompositionPreferences = data.decompositionPreferences || [];
    
    const criteria = data.criteria || [];
    const criterionTypes = data.criterionTypes || [];
    const levels = data.levels || [];
    const alternatives = data.alternatives || [];
    const matrix = data.matrix || [];
    
    document.getElementById('loadedProblemId').value = data.problemId;
    document.getElementById('problemName').value = data.problemName || '';
    const rationalityEl = document.getElementById('problemRationality');
    if (rationalityEl) rationalityEl.value = data.rationality || 'compensatory';
    document.getElementById('numCrit').value = criteria.length;
    document.getElementById('numAlt').value = alternatives.length;
    
    generateMatrix(alternatives.length, criteria.length);
    
    document.querySelectorAll('.crit-name').forEach((inp, idx) => {
        if (idx < criteria.length) inp.value = criteria[idx];
    });
    
    document.querySelectorAll('.crit-type').forEach((select, idx) => {
        if (idx < criterionTypes.length) {
            select.value = criterionTypes[idx];
            toggleNiveis(select, idx);
        }
    });
    
    document.querySelectorAll('.crit-niveis').forEach((inp, idx) => {
        if (idx < levels.length) {
            inp.value = levels[idx] || '';
        }
    });
    
    document.querySelectorAll('.alt-name').forEach((inp, idx) => {
        if (idx < alternatives.length) inp.value = alternatives[idx];
    });
    
    const conseqInputs = Array.from(document.querySelectorAll('.conseq-val'));
    conseqInputs.forEach(inp => {
        const row = parseInt(inp.getAttribute('data-row'));
        const col = parseInt(inp.getAttribute('data-col'));
        if (row < matrix.length && col < matrix[row].length) {
            inp.value = matrix[row][col];
        }
    });
    
    updateHolisticDropdowns();
}

async function solveProblem() {
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    
    // If running in Delphi context, delegate to the Delphi submit trigger
    if (window.delphiTriggerId && window.delphiProblemDataId && window.delphiActionTypeId) {
        const payload = getProblemDataPayload();
        if (!payload) return;
        document.getElementById(window.delphiProblemDataId).value = JSON.stringify(payload);
        document.getElementById(window.delphiActionTypeId).value = 'solve';
        document.getElementById(window.delphiTriggerId).click();
        return;
    }
    
    // Auto-save first
    const savedId = await saveProblemAction();
    
    const numCrit = parseInt(document.getElementById('numCrit').value);
    const numAlt = parseInt(document.getElementById('numAlt').value);
    
    const nomeCrit = Array.from(document.querySelectorAll('.crit-name')).map(i => i.value);
    const tipoCrit = Array.from(document.querySelectorAll('.crit-type')).map(s => parseInt(s.value));
    const niveisCrit = tipoCrit.map((type, idx) => {
        if (type === 2 || type === 3) {
            const val = parseInt(document.getElementById(`niveis-${idx}`).value);
            return isNaN(val) ? 0 : val;
        }
        return 0;
    });
    const nomeAlt = Array.from(document.querySelectorAll('.alt-name')).map(i => i.value);
    
    const matrizConseq = [];
    for (let j = 0; j < numAlt; j++) {
        const row = [];
        for (let i = 0; i < numCrit; i++) {
            const val = parseFloat(document.querySelector(`.conseq-val[data-row="${j}"][data-col="${i}"]`).value);
            row.push(isNaN(val) ? 0 : val);
        }
        matrizConseq.push(row);
    }
    
    const rationalityEl = document.getElementById('problemRationality');
    const rationality = rationalityEl ? rationalityEl.value : 'compensatory';

    const payload = {
        problemName: document.getElementById('problemName').value,
        rationality,
        numCrit, numAlt, nomeCrit, tipoCrit, niveisCrit, nomeAlt, matrizConseq,
        holisticEvaluations: (window.loadedHolisticEvaluations && window.loadedHolisticEvaluations.length > 0) ? window.loadedHolisticEvaluations : getHolisticEvaluationsPayload(),
        decompositionPreferences: (window.loadedDecompositionPreferences && window.loadedDecompositionPreferences.length > 0) ? window.loadedDecompositionPreferences : []
    };
    
    const btn = document.getElementById('btnSolve');
    btn.innerHTML = `${dict.running || 'Running...'} <span class="icon">⌛</span>`;
    btn.disabled = true;
    
    try {
        const res = await fetch('/api/solve', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (data.success) {
            data.problemId = document.getElementById('loadedProblemId').value;
            sessionStorage.setItem('spearResults', JSON.stringify(data));
            window.location.href = '/results';
        } else {
            alert((dict.error_prefix || 'Error: ') + data.error);
        }
    } catch (err) {
        alert(dict.network_error || 'Network Error');
    } finally {
        btn.innerHTML = dict.show_results || 'Show Results';
        btn.disabled = false;
    }
}

// --- RENDER RESULTS ---

const chartColors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(14, 165, 233, 0.8)'
];

function renderResults(data) {
    currentResultsData = data;
    const rationality = data.rationality || 'compensatory';
    
    // Destroy previous charts to avoid overlapping canvas issues
    if (rocChart) { rocChart.destroy(); rocChart = null; }
    if (prometheeChart) { prometheeChart.destroy(); prometheeChart = null; }
    if (filterChartInstance) { filterChartInstance.destroy(); filterChartInstance = null; }
    if (distChartInstance) { distChartInstance.destroy(); distChartInstance = null; }
    if (consequenceChartInstance) { consequenceChartInstance.destroy(); consequenceChartInstance = null; }
    
    // Set active models based on rationality and toggle view visibility
    if (rationality === 'compensatory') {
        activeFilterModel = 'roc';
        activeDistModel = 'roc';
        
        document.querySelectorAll('.promethee-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.roc-only').forEach(el => el.style.display = 'block');
    } else {
        activeFilterModel = 'promethee';
        activeDistModel = 'promethee';
        
        document.querySelectorAll('.roc-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.promethee-only').forEach(el => el.style.display = 'block');
    }
    
    const totalCasesRoc = data.roc?.totalCases || data.totalCases;
    const totalCasesPromethee = data.promethee?.totalCases || data.totalCases;
    
    if (rationality === 'compensatory') {
        renderMethodTab('roc', data.roc, data.nomesAlt, totalCasesRoc, 'rocTable', 'rocChart', chartColors);
        renderStatsTable('statsRocAvgTable', data.roc.stats.media_geral_naosol, data.roc.resultSol, data.nomesAlt, data.roc.matrizSol, totalCasesRoc);
        renderStatsMaxMinTable('statsRocMaxMinTable', data.roc.stats.maximo_geral_naosol, data.roc.stats.minimo_geral_naosol, data.nomesAlt, data.roc.matrizSol);
        renderDecisionRules('roc', data.roc.decisionRule);
    } else {
        renderMethodTab('promethee', data.promethee, data.nomesAlt, totalCasesPromethee, 'prometheeTable', 'prometheeChart', chartColors.slice().reverse());
        renderStatsTable('statsPromAvgTable', data.promethee.stats.media_geral_naosol, data.promethee.resultSol, data.nomesAlt, data.promethee.matrizSol, totalCasesPromethee);
        renderStatsMaxMinTable('statsPromMaxMinTable', data.promethee.stats.maximo_geral_naosol, data.promethee.stats.minimo_geral_naosol, data.nomesAlt, data.promethee.matrizSol);
        renderDecisionRules('prom', data.promethee.decisionRule);
    }
    
    renderElicitation(data.elicitation, data.nomesCrit, data.nomesAlt);
    
    // Save current active tab and subtab
    let activeTabId = 'tabPartialResults';
    const activePanel = document.querySelector('.tab-panel.active');
    if (activePanel) {
        activeTabId = activePanel.id;
    }
    
    let activeSubTabId = null;
    if (activePanel) {
        const activeSubPanel = activePanel.querySelector('.subtab-panel.active');
        if (activeSubPanel) {
            activeSubTabId = activeSubPanel.id;
        }
    }
    
    // Restore main tab active state
    openTab(null, activeTabId);
    const tabBtn = document.querySelector(`.tab-link[onclick*="'${activeTabId}'"]`);
    if (tabBtn) {
        document.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active'));
        tabBtn.classList.add('active');
    }
    
    // Restore subtab active state
    if (activeSubTabId) {
        const subPanel = document.getElementById(activeSubTabId);
        if (subPanel) {
            const parentPanel = subPanel.closest('.tab-panel');
            if (parentPanel) {
                parentPanel.querySelectorAll('.subtab-panel').forEach(p => p.classList.remove('active'));
                subPanel.classList.add('active');
                
                const subBtn = parentPanel.querySelector(`.subtab-link[onclick*="'${activeSubTabId}'"]`);
                if (subBtn) {
                    parentPanel.querySelectorAll('.subtab-link').forEach(btn => btn.classList.remove('active'));
                    subBtn.classList.add('active');
                }
            }
        }
    } else {
        // Fallback defaults
        if (activeTabId === 'tabPartialResults') {
            const panel = document.getElementById('tabPartialResults');
            if (panel) {
                panel.querySelectorAll('.subtab-panel').forEach(p => p.classList.remove('active'));
                const freqSub = document.getElementById('subTabFreq');
                if (freqSub) freqSub.classList.add('active');
                
                panel.querySelectorAll('.subtab-link').forEach(btn => btn.classList.remove('active'));
                const freqBtn = panel.querySelector('.subtab-link');
                if (freqBtn) freqBtn.classList.add('active');
            }
        } else if (activeTabId === 'tabElicitation') {
            const panel = document.getElementById('tabElicitation');
            if (panel) {
                panel.querySelectorAll('.subtab-panel').forEach(p => p.classList.remove('active'));
                const ordSub = document.getElementById('subTabCritOrdering');
                if (ordSub) ordSub.classList.add('active');
                
                panel.querySelectorAll('.subtab-link').forEach(btn => btn.classList.remove('active'));
                const ordBtn = panel.querySelector('.subtab-link');
                if (ordBtn) ordBtn.classList.add('active');
            }
        }
    }
    
    initInteractiveResultsFeatures(data);
}

function getSolutionLabel(matrizSolRow, nomesAlt) {
    const alts = [];
    for(let i=0; i<matrizSolRow.length; i++) {
        if(matrizSolRow[i] === 1) alts.push(nomesAlt[i]);
    }
    return alts.join(' + ');
}

function renderMethodTab(methodKey, methodData, nomesAlt, totalCases, tableId, canvasId, colors) {
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';
    
    const labels = [];
    const freqs = [];
    
    const sumFreqs = methodData.resultSol.reduce((a, b) => a + b, 0);
    for(let i=0; i<methodData.resultSol.length; i++) {
        if(methodData.resultSol[i] === 0) continue;
        const label = getSolutionLabel(methodData.matrizSol[i], nomesAlt);
        const freq = methodData.resultSol[i];
        const pct = sumFreqs > 0 ? ((freq / sumFreqs) * 100).toFixed(2) : '0.00';
        
        labels.push(label);
        freqs.push(freq);
        
        tbody.innerHTML += `<tr>
            <td>${label}</td>
            <td>${freq}</td>
            <td>${pct}%</td>
        </tr>`;
    }
    
    const ctx = document.getElementById(canvasId).getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: dict.freq_header || 'Frequency',
                data: freqs,
                backgroundColor: colors.slice(0, labels.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(226, 232, 240, 0.6)' },
                    ticks: { 
                        color: '#64748b',
                        font: { family: "'Inter', sans-serif", size: 11 }
                    }
                },
                x: { 
                    grid: { display: false },
                    ticks: { 
                        color: '#64748b',
                        font: { family: "'Inter', sans-serif", size: 11 }
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
    
    if (methodKey === 'roc') rocChart = chart;
    else prometheeChart = chart;
}

function renderStatsTable(tableId, medias_naosol, freq, nomesAlt, matrizSol, totalCases) {
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    const thead = document.querySelector(`#${tableId} thead`);
    const tbody = document.querySelector(`#${tableId} tbody`);
    
    thead.innerHTML = `<tr>
        <th>${dict.alternative}</th>
        <th>${dict.average_loss || 'Perda Média'}</th>
        <th>${dict.prob_being_sol || 'Probabilidade de Ser uma Solução'}</th>
    </tr>`;
    tbody.innerHTML = '';
    
    const sumFreqs = freq.reduce((a, b) => a + b, 0);
    for(let i=0; i<medias_naosol.length; i++) {
        const label = getSolutionLabel(matrizSol[i], nomesAlt);
        const pct = sumFreqs > 0 ? ((freq[i] / sumFreqs) * 100).toFixed(2) : '0.00';
        tbody.innerHTML += `<tr>
            <td style="font-weight:600; text-align:left;">${label}</td>
            <td style="color:#b91c1c; font-weight:700;">${medias_naosol[i].toFixed(4)}</td>
            <td style="font-weight:600; text-align:center;">${pct}%</td>
        </tr>`;
    }
}

function renderStatsMaxMinTable(tableId, maximos_naosol, minimos_naosol, nomesAlt, matrizSol) {
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    const thead = document.querySelector(`#${tableId} thead`);
    const tbody = document.querySelector(`#${tableId} tbody`);
    thead.innerHTML = `<tr>
        <th>${dict.alternative}</th>
        <th>${dict.max_loss || 'Perda Máxima'}</th>
        <th>${dict.min_loss || 'Perda Mínima'}</th>
    </tr>`;
    tbody.innerHTML = '';
    
    for(let i=0; i<maximos_naosol.length; i++) {
        const label = getSolutionLabel(matrizSol[i], nomesAlt);
        const maxVal = maximos_naosol[i].toFixed(4);
        const minVal = minimos_naosol[i] > 900000 ? 'N/A' : minimos_naosol[i].toFixed(4);
        tbody.innerHTML += `<tr>
            <td style="font-weight:600; text-align:left;">${label}</td>
            <td style="color:#b91c1c; font-weight:700;">${maxVal}</td>
            <td style="color:#15803d; font-weight:700; text-align:center;">${minVal}</td>
        </tr>`;
    }
}

function renderDecisionRules(prefix, ruleData) {
    const statusEl = document.getElementById(`${prefix}RecStatus`);
    const altsEl = document.getElementById(`${prefix}RecAlts`);
    const detailsEl = document.getElementById(`${prefix}RecDetails`);
    
    const lang = localStorage.getItem('spear_lang') || 'en';
    let statusText = ruleData.status;
    if (lang === 'pt') {
        if (statusText === 'Unique recommendation') statusText = 'Recomendação única';
        else if (statusText === 'Multiple recommendations') statusText = 'Múltiplas recomendações';
        else if (statusText === 'No recommendations') statusText = 'Nenhuma recomendação';
    }
    
    statusEl.textContent = statusText;
    if(ruleData.recommended_alts.length > 0) {
        const res = JSON.parse(sessionStorage.getItem('spearResults'));
        const nomesAlt = res.nomesAlt;
        const mappedAlts = ruleData.recommended_alts.map(i => nomesAlt[i]);
        altsEl.textContent = mappedAlts.join(', ');
    } else {
        altsEl.textContent = '-';
    }
    
    const probLabel = lang === 'pt' ? 'Probabilidade' : 'Probability';
    const levelLabel = lang === 'pt' ? 'Nível da Regra' : 'Rule Level';
    detailsEl.textContent = `${probLabel}: ${ruleData.probability.toFixed(2)}% | ${levelLabel}: ${ruleData.rule_level}`;
}

function renderElicitation(data, nomesCrit, nomesAlt) {
    const lang = localStorage.getItem('spear_lang') || 'en';
    const altXName = data.altX !== -1 ? nomesAlt[data.altX] : (lang === 'pt' ? 'Nenhuma' : 'None');
    const altZName = data.altZ !== -1 ? nomesAlt[data.altZ] : (lang === 'pt' ? 'Nenhuma' : 'None');
    
    const sub = document.getElementById('elicitationSubtitle');
    if (sub) {
        sub.textContent = `X = ${altXName}, Z = ${altZName}`;
    }
    
    populateMatrixTable('elicitProbX', data.matrizProbX, nomesCrit);
    populateMatrixTable('elicitProbZ', data.matrizProbZ, nomesCrit);
    populateMatrixTable('elicitProbOutros', data.matrizProbOutros, nomesCrit);
}

function populateMatrixTable(tableId, matrix, names) {
    const thead = document.querySelector(`#${tableId} thead`);
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!thead || !tbody) return;
    
    let headHtml = '<tr><th>C1 &gt; C2</th>';
    for(let n of names) headHtml += `<th>${n}</th>`;
    headHtml += '</tr>';
    thead.innerHTML = headHtml;
    
    tbody.innerHTML = '';
    for(let i=0; i<names.length; i++) {
        let row = `<tr><td><strong>${names[i]}</strong></td>`;
        for(let j=0; j<names.length; j++) {
            if(i === j) row += `<td style="color:var(--text-muted)">-</td>`;
            else row += `<td>${(matrix[i][j]*100).toFixed(1)}%</td>`;
        }
        row += '</tr>';
        tbody.innerHTML += row;
    }
}

function highlightMatrixGrid(rowIdx, colIdx, shouldHighlight) {
    const table = document.getElementById('matrixTable');
    if (!table) return;

    // Highlight row cells/inputs
    const rowInputs = table.querySelectorAll(`.conseq-val[data-row="${rowIdx}"]`);
    rowInputs.forEach(input => {
        input.classList.toggle('highlight-row-cell', shouldHighlight);
    });

    // Highlight alternative name input
    if (rowInputs.length > 0) {
        const tr = rowInputs[0].closest('tr');
        if (tr) {
            const altInput = tr.querySelector('.alt-name');
            if (altInput) altInput.classList.toggle('highlight-header-cell', shouldHighlight);
            tr.classList.toggle('highlight-row-bg', shouldHighlight);
        }
    }

    // Highlight column inputs
    const colInputs = table.querySelectorAll(`.conseq-val[data-col="${colIdx}"]`);
    colInputs.forEach(input => {
        input.classList.toggle('highlight-col-cell', shouldHighlight);
    });

    // Highlight headers for this column
    const headTr = table.querySelector('tr');
    if (headTr) {
        const ths = headTr.querySelectorAll('th');
        if (ths[colIdx + 1]) {
            const critInput = ths[colIdx + 1].querySelector('.crit-name');
            if (critInput) critInput.classList.toggle('highlight-header-cell', shouldHighlight);
        }
    }

    // Highlight type selector row and levels row
    const allTrs = table.querySelectorAll('tr');
    if (allTrs.length > 2) {
        const typeTd = allTrs[1].querySelectorAll('td')[colIdx + 1];
        if (typeTd) {
            const typeSelect = typeTd.querySelector('.crit-type');
            if (typeSelect) typeSelect.classList.toggle('highlight-header-cell', shouldHighlight);
        }
        const levelsTd = allTrs[2].querySelectorAll('td')[colIdx + 1];
        if (levelsTd) {
            const levelsInput = levelsTd.querySelector('.crit-niveis');
            if (levelsInput) levelsInput.classList.toggle('highlight-header-cell', shouldHighlight);
        }
    }
}

// ----------- CONVERGENCE HELPERS -----------
function getFilteredUniqueSolutions(model, matchingIndices) {
    const rawPoa = model === 'roc' ? currentResultsData.raw.matrizPoa : currentResultsData.raw.matrizPoaPromethee;
    const uniqueSols = [];
    const counts = [];
    
    for (const k of matchingIndices) {
        if (k >= rawPoa.length) continue;
        const row = rawPoa[k];
        let foundIdx = -1;
        for (let idx = 0; idx < uniqueSols.length; idx++) {
            let equal = true;
            for (let j = 0; j < row.length; j++) {
                if (uniqueSols[idx][j] !== row[j]) {
                    equal = false;
                    break;
                }
            }
            if (equal) {
                foundIdx = idx;
                break;
            }
        }
        if (foundIdx !== -1) {
            counts[foundIdx]++;
        } else {
            uniqueSols.push(row);
            counts.push(1);
        }
    }
    return { uniqueSols, counts };
}

async function recalculateActiveResults(redirectTab = null) {
    if (!currentResultsData || !originalResultsData) return;

    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
    
    // Prepare the payload based on originalResultsData
    const payload = {
        problemName: originalResultsData.problemName,
        rationality: originalResultsData.rationality || 'compensatory',
        numCrit: originalResultsData.nomesCrit.length,
        numAlt: originalResultsData.nomesAlt.length,
        nomeCrit: originalResultsData.nomesCrit,
        tipoCrit: originalResultsData.tipoCrit,
        niveisCrit: originalResultsData.niveisCrit || Array(originalResultsData.nomesCrit.length).fill(0),
        nomeAlt: originalResultsData.nomesAlt,
        matrizConseq: originalResultsData.matrizConseq,
        
        // Pass the active filters
        rankFilters: activeFilters,
        holisticEvaluations: activeHolisticFilters.map(hf => ({
            alt1: originalResultsData.nomesAlt[hf.alt1Idx],
            relation: hf.relation,
            alt2: hf.alt2Idx === 'fictitious' ? 'fictitious' : originalResultsData.nomesAlt[hf.alt2Idx],
            fictitiousValue: hf.alt2Idx === 'fictitious' ? hf.fictitiousValue : null
        })),
        decompositionPreferences: activeDecompositionPreferences,
        excludedPairs: excludedDecompositionPairs
    };
    
    // Clear any previous warning
    const holisticWarnEl = document.getElementById('holisticWarning');
    const filterWarnEl = document.getElementById('filterWarning');
    const decompositionWarnEl = document.getElementById('decompositionWarning');
    if (decompositionWarnEl) decompositionWarnEl.style.display = 'none';
    if (holisticWarnEl) holisticWarnEl.style.display = 'none';
    if (filterWarnEl) filterWarnEl.style.display = 'none';
    
    try {
        const res = await fetch('/api/solve', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            currentResultsData = data;
            
            // Check if converged: use backend's decompositionQuestion as authoritative signal
            const hasNextQuestion = data.decompositionQuestion !== null && data.decompositionQuestion !== undefined;
            const converged = !hasNextQuestion;

            // If a specific tab redirect was requested (not convergence), switch to it now
            // Convergence tab switching is handled by showFinalResults inside initInteractiveResultsFeatures
            if (redirectTab && !converged) {
                const targetTab = redirectTab === true ? 'tabPartialResults' : redirectTab;
                
                // Force active tab to be targetTab
                const panels = document.querySelectorAll('.tab-panel');
                panels.forEach(p => p.classList.remove('active'));
                const target = document.getElementById(targetTab);
                if (target) target.classList.add('active');
                
                // Also update tab links
                const tabLinks = document.querySelectorAll('.tab-link');
                tabLinks.forEach(btn => btn.classList.remove('active'));
                const tabBtn = document.getElementById(targetTab + 'Btn') || document.querySelector(`.tab-link[onclick*="'${targetTab}'"]`);
                if (tabBtn) tabBtn.classList.add('active');
                
                // Force subtab active state inside tabPartialResults to Frequencies
                if (targetTab === 'tabPartialResults') {
                    const partialSubPanel = document.getElementById('subTabFreq');
                    if (partialSubPanel) {
                        const parent = partialSubPanel.closest('.tab-panel');
                        if (parent) {
                            parent.querySelectorAll('.subtab-panel').forEach(p => p.classList.remove('active'));
                            partialSubPanel.classList.add('active');
                            
                            const subBtn = parent.querySelector(`.subtab-link[onclick*="'subTabFreq'"]`);
                            if (subBtn) {
                                parent.querySelectorAll('.subtab-link').forEach(btn => btn.classList.remove('active'));
                                subBtn.classList.add('active');
                            }
                        }
                    }
                }
            }
            
            // Re-render the results (convergence check + tab switch is done inside initInteractiveResultsFeatures)
            renderResults(data);
        } else {
            // Show error in warning divs
            if (holisticWarnEl) {
                holisticWarnEl.textContent = data.error;
                holisticWarnEl.style.display = 'block';
            }
            if (filterWarnEl) {
                filterWarnEl.textContent = data.error;
                filterWarnEl.style.display = 'block';
            }
            if (decompositionWarnEl) {
                decompositionWarnEl.textContent = data.error;
                decompositionWarnEl.style.display = 'block';
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        if (overlay) overlay.style.display = 'none';
    }
}

function getRocWeights(numCrit) {
    const weights = [];
    for (let i = 0; i < numCrit; i++) {
        let sum = 0;
        for (let j = i + 1; j <= numCrit; j++) {
            sum += 1.0 / j;
        }
        weights.push(sum / numCrit);
    }
    return weights;
}

function showFinalResults(winnerProfile) {
    try {
        const winnerIdx = winnerProfile.indexOf(1);
        if (winnerIdx === -1) return;

        const finalWinnerName = document.getElementById('finalWinnerName');
        if (finalWinnerName) {
            finalWinnerName.textContent = getSolutionLabel(winnerProfile, currentResultsData.nomesAlt);
        }
        
        const lang = localStorage.getItem('spear_lang') || 'en';
        const dict = translations[lang] || translations.en;

        // 1. Render Consequences Table
        const tbody = document.querySelector('#finalConsequenceTable tbody');
        if (tbody) {
            tbody.innerHTML = '';
            const numCrit = currentResultsData.nomesCrit.length;
            const typeLabels = [
                dict.crit_type_continuous,
                dict.crit_type_continuous,
                dict.crit_type_discrete,
                dict.crit_type_discrete,
                dict.crit_type_integer,
                dict.crit_type_integer
            ];
            const dirLabels = [
                dict.crit_dir_min,
                dict.crit_dir_max,
                dict.crit_dir_min,
                dict.crit_dir_max,
                dict.crit_dir_min,
                dict.crit_dir_max
            ];
            for (let i = 0; i < numCrit; i++) {
                const critName = currentResultsData.nomesCrit[i];
                const critTypeIdx = currentResultsData.tipoCrit[i];
                const typeLabel = typeLabels[critTypeIdx] || 'N/A';
                const dirLabel = dirLabels[critTypeIdx] || 'N/A';
                const value = currentResultsData.matrizConseq[winnerIdx][i];
                tbody.innerHTML += `
                    <tr>
                        <td style="font-weight:600; text-align:left;">${critName}</td>
                        <td style="color:var(--text-muted); text-align:center;">${typeLabel}</td>
                        <td style="color:var(--text-muted); text-align:center;">${dirLabel}</td>
                        <td style="font-weight:700; color:var(--delphi-light-blue); text-align:center;">${value}</td>
                    </tr>
                `;
            }
        }
        
        // Fill applied filters summaries
        const finalAppliedRankFilters = document.getElementById('finalAppliedRankFilters');
        const finalAppliedHolisticFilters = document.getElementById('finalAppliedHolisticFilters');
        
        if (finalAppliedRankFilters) {
            finalAppliedRankFilters.innerHTML = '';
            let hasRank = false;
            for (let p = 0; p < activeFilters.length; p++) {
                const critIdx = activeFilters[p];
                if (critIdx !== null) {
                    const critName = currentResultsData.nomesCrit[critIdx];
                    const ord = getOrdinalSuffix(p + 1);
                    const li = document.createElement('li');
                    li.textContent = `${critName} ${dict.at_pos || 'at'} ${ord}`;
                    finalAppliedRankFilters.appendChild(li);
                    hasRank = true;
                }
            }
            if (!hasRank) {
                const li = document.createElement('li');
                li.textContent = lang === 'pt' ? 'Nenhuma ordenação aplicada' : 'No criteria ordering';
                li.style.color = 'var(--text-muted)';
                finalAppliedRankFilters.appendChild(li);
                hasRank = true;
            }
        }
        
        if (finalAppliedHolisticFilters) {
            finalAppliedHolisticFilters.innerHTML = '';
            let hasHolistic = false;
            activeHolisticFilters.forEach(hf => {
                const alt1Name = currentResultsData.nomesAlt[hf.alt1Idx];
                const alt2Name = hf.alt2Idx === 'fictitious'
                    ? (lang === 'pt' ? 'Alternativa Fictícia' : 'Fictitious Alternative')
                    : currentResultsData.nomesAlt[hf.alt2Idx];
                const rel = hf.relation === '>=' ? '≥' : '≤';
                const li = document.createElement('li');
                li.textContent = `${alt1Name} ${rel} ${alt2Name}`;
                finalAppliedHolisticFilters.appendChild(li);
                hasHolistic = true;
            });
            if (!hasHolistic) {
                const li = document.createElement('li');
                li.textContent = lang === 'pt' ? 'Nenhuma preferência holística' : 'No holistic preferences';
                li.style.color = 'var(--text-muted)';
                finalAppliedHolisticFilters.appendChild(li);
                hasHolistic = true;
            }
        }

        // 2. Render Global Value Range Chart
        try {
            if (finalGlobalValueChartInstance) {
                finalGlobalValueChartInstance.destroy();
                finalGlobalValueChartInstance = null;
            }
            
            const rationality = currentResultsData.rationality || 'compensatory';
            const model = rationality === 'compensatory' ? 'roc' : 'promethee';
            const rawVals = model === 'roc' ? currentResultsData.raw.resultadoRoc : currentResultsData.raw.resultadoPromethee;

            // Update chart title based on model
            const chartTitleEl = document.getElementById('finalGlobalValueChartTitle');
            if (chartTitleEl) {
                chartTitleEl.textContent = model === 'roc'
                    ? (dict.winner_global_value_range || "Winning Alternative's Global Value Range")
                    : (dict.winner_net_flow_range || "Winning Alternative's Net Flow Range");
            }
            
            if (rawVals && rawVals.length > 0) {
                const winnerVals = rawVals.map(row => row[winnerIdx]);
                const minVal = Math.min(...winnerVals);
                const maxVal = Math.max(...winnerVals);
                const avgVal = winnerVals.reduce((sum, v) => sum + v, 0) / winnerVals.length;

                const ctxGlobal = document.getElementById('finalGlobalValueChart').getContext('2d');
                finalGlobalValueChartInstance = new Chart(ctxGlobal, {
                    type: 'bar',
                    data: {
                        labels: [currentResultsData.nomesAlt[winnerIdx]],
                        datasets: [
                            {
                                label: dict.global_val_range || 'Intervalo de Valor Global [Mín, Máx]',
                                data: [[minVal, maxVal]],
                                backgroundColor: model === 'roc' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                                borderColor: model === 'roc' ? 'rgba(59, 130, 246, 1)' : 'rgba(16, 185, 129, 1)',
                                borderWidth: 2,
                                borderRadius: 6,
                                borderSkipped: false,
                                barThickness: 16,
                                indexAxis: 'y'
                            },
                            {
                                label: dict.avg || 'Média (μ)',
                                data: [avgVal],
                                type: 'line',
                                showLine: false,
                                backgroundColor: '#ffffff',
                                borderColor: '#ef4444',
                                borderWidth: 2.5,
                                pointRadius: 6,
                                pointHoverRadius: 8,
                                indexAxis: 'y'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        layout: {
                            padding: {
                                right: 25,
                                left: 10,
                                top: 5,
                                bottom: 5
                            }
                        },
                        scales: {
                            x: {
                                min: model === 'roc' ? 0 : -1,
                                max: model === 'roc' ? 1 : 1,
                                title: {
                                    display: true,
                                    text: model === 'roc' ? (dict.utility || 'Valor Global') : (dict.net_flow || 'Fluxo Líquido'),
                                    font: { family: "'Inter', sans-serif", weight: 600, size: 12 },
                                    color: '#475569'
                                },
                                grid: { color: 'rgba(148, 163, 184, 0.12)' },
                                ticks: {
                                    color: '#64748b',
                                    font: { family: "'Inter', sans-serif", size: 11 }
                                }
                            },
                            y: {
                                grid: { display: false },
                                ticks: {
                                    color: '#475569',
                                    font: { family: "'Inter', sans-serif", weight: 600, size: 12 }
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                                labels: {
                                    boxWidth: 12,
                                    boxHeight: 12,
                                    usePointStyle: true,
                                    pointStyle: 'rectRounded',
                                    font: { family: "'Inter', sans-serif", size: 11 },
                                    color: '#475569'
                                }
                            }
                        }
                    }
                });
            }
        } catch (chartErr) {
            console.error("Error rendering finalGlobalValueChart:", chartErr);
        }

        // 3. Render Criteria Weights Range Chart
        try {
            if (finalCriteriaWeightsChartInstance) {
                finalCriteriaWeightsChartInstance.destroy();
                finalCriteriaWeightsChartInstance = null;
            }

            const numCrit = currentResultsData.nomesCrit.length;
            const rocWeights = getRocWeights(numCrit);
            const rationality = currentResultsData.rationality || 'compensatory';
            const model = rationality === 'compensatory' ? 'roc' : 'promethee';
            const casesOrdem = model === 'roc' ? currentResultsData.raw.casesOrdemCritRoc : currentResultsData.raw.casesOrdemCritPromethee;

            if (casesOrdem && casesOrdem.length > 0) {
                const weightRanges = [];
                const weightAverages = [];
                const critLabels = currentResultsData.nomesCrit;
                
                const isEqualWeights = (r) => r.every(v => v === 0);
                
                for (let i = 0; i < numCrit; i++) {
                    const critWeights = [];
                    for (let k = 0; k < casesOrdem.length; k++) {
                        const row = casesOrdem[k];
                        if (row) {
                            if (isEqualWeights(row)) {
                                critWeights.push(1.0 / numCrit);
                            } else {
                                const rank = row[i] - 1;
                                if (rank >= 0 && rank < rocWeights.length) {
                                    critWeights.push(rocWeights[rank]);
                                } else {
                                    critWeights.push(0);
                                }
                            }
                        }
                    }
                    if (critWeights.length > 0) {
                        const cMin = Math.min(...critWeights);
                        const cMax = Math.max(...critWeights);
                        const cAvg = critWeights.reduce((sum, v) => sum + v, 0) / critWeights.length;
                        weightRanges.push([cMin, cMax]);
                        weightAverages.push(cAvg);
                    } else {
                        weightRanges.push([0, 0]);
                        weightAverages.push(0);
                    }
                }

                const ctxWeights = document.getElementById('finalCriteriaWeightsChart').getContext('2d');
                finalCriteriaWeightsChartInstance = new Chart(ctxWeights, {
                    type: 'bar',
                    data: {
                        labels: critLabels,
                        datasets: [
                            {
                                label: dict.weight_range || 'Intervalo de Peso [Mín, Máx]',
                                data: weightRanges,
                                backgroundColor: 'rgba(245, 158, 11, 0.25)',
                                borderColor: 'rgba(245, 158, 11, 1)',
                                borderWidth: 2,
                                borderRadius: 6,
                                borderSkipped: false,
                                barThickness: 14,
                                indexAxis: 'y'
                            },
                            {
                                label: dict.avg || 'Média (μ)',
                                data: weightAverages,
                                type: 'line',
                                showLine: false,
                                backgroundColor: '#ffffff',
                                borderColor: '#ef4444',
                                borderWidth: 2.5,
                                pointRadius: 6,
                                pointHoverRadius: 8,
                                indexAxis: 'y'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        layout: {
                            padding: {
                                right: 25,
                                left: 10,
                                top: 5,
                                bottom: 5
                            }
                        },
                        scales: {
                            x: {
                                min: 0,
                                max: 1,
                                title: {
                                    display: true,
                                    text: lang === 'pt' ? 'Peso' : 'Weight',
                                    font: { family: "'Inter', sans-serif", weight: 600, size: 12 },
                                    color: '#475569'
                                },
                                grid: { color: 'rgba(148, 163, 184, 0.12)' },
                                ticks: {
                                    color: '#64748b',
                                    font: { family: "'Inter', sans-serif", size: 11 }
                                }
                            },
                            y: {
                                grid: { display: false },
                                ticks: {
                                    color: '#475569',
                                    font: { family: "'Inter', sans-serif", weight: 600, size: 12 }
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                                labels: {
                                    boxWidth: 12,
                                    boxHeight: 12,
                                    usePointStyle: true,
                                    pointStyle: 'rectRounded',
                                    font: { family: "'Inter', sans-serif", size: 11 },
                                    color: '#475569'
                                }
                            }
                        }
                    }
                });
            }
        } catch (chartErr) {
            console.error("Error rendering finalCriteriaWeightsChart:", chartErr);
        }
    } catch (err) {
        console.error("Error in showFinalResults:", err);
    } finally {
        // Toggle tab visibility and select the tab
        const finalTabBtn = document.getElementById('tabFinalResultsBtn');
        const partialTabBtn = document.getElementById('tabPartialResultsBtn');
        const elicitationTabBtn = document.getElementById('tabElicitationBtn');
        
        const tabSensitivity = document.getElementById('tabSensitivity');
        if (tabSensitivity && tabSensitivity.classList.contains('active')) {
            if (finalTabBtn) finalTabBtn.style.display = 'none';
            if (partialTabBtn) partialTabBtn.style.display = 'none';
            if (elicitationTabBtn) elicitationTabBtn.style.display = 'none';
            openTab(null, 'tabSensitivity');
        } else {
            if (finalTabBtn) finalTabBtn.style.display = 'block';
            if (partialTabBtn) partialTabBtn.style.display = 'none';
            if (elicitationTabBtn) elicitationTabBtn.style.display = 'none';
            openTab(null, 'tabFinalResults');
            if (finalTabBtn) finalTabBtn.classList.add('active');
        }
    }
}

function showPartialAndElicitation() {
    const finalTabBtn = document.getElementById('tabFinalResultsBtn');
    const partialTabBtn = document.getElementById('tabPartialResultsBtn');
    const elicitationTabBtn = document.getElementById('tabElicitationBtn');
    
    if (finalTabBtn) finalTabBtn.style.display = 'none';
    if (partialTabBtn) partialTabBtn.style.display = 'block';
    if (elicitationTabBtn) elicitationTabBtn.style.display = 'block';
    
    const finalPanel = document.getElementById('tabFinalResults');
    if (finalPanel && finalPanel.classList.contains('active')) {
        openTab(null, 'tabPartialResults');
        if (partialTabBtn) partialTabBtn.classList.add('active');
    }
}

// ----------- INTERACTIVE FILTERS & DISTRIBUTIONS LOGIC -----------

// ── GLOBAL UTILITY: clone an element by ID to clear all event listeners ──────
function replaceWithClone(id) {
    const el = document.getElementById(id);
    if (el) {
        const clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);
        return clone;
    }
    return null;
}

function initInteractiveResultsFeatures(data) {
    currentResultsData = data;
    const numCrit = data.nomesCrit.length;

    // Initial draw of the SWING criteria scale chart
    drawSwingChart();

    // 1. Populate rank position dropdown selects
    const grid = document.getElementById('filterSelectorsGrid');
    if (grid) {
        let html = '';
        for (let p = 0; p < numCrit; p++) {
            const ord = getOrdinalSuffix(p + 1);
            html += `
                <div class="filter-control-group">
                    <label class="filter-label">${ord} Position</label>
                    <select class="select-delphi filter-rank-select" data-position="${p}">
                        <option value="">Any Criterion</option>
                        ${data.nomesCrit.map((name, idx) => {
                            const selected = activeFilters[p] === idx ? 'selected' : '';
                            return `<option value="${idx}" ${selected}>${name}</option>`;
                        }).join('')}
                    </select>
                </div>
            `;
        }
        grid.innerHTML = html;

        // Add event listeners to dropdowns
        const selects = grid.querySelectorAll('.filter-rank-select');
        selects.forEach(select => {
            select.addEventListener('change', () => {
                const pos = parseInt(select.getAttribute('data-position'));
                const val = select.value;
                activeFilters[pos] = val === '' ? null : parseInt(val);
                
                recalculateActiveResults();
            });
        });
    }

    // 2. Reset button
    const btnReset = replaceWithClone('btnResetFilters');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            activeFilters = Array(numCrit).fill(null);
            if (grid) {
                const selects = grid.querySelectorAll('.filter-rank-select');
                selects.forEach(select => {
                    select.value = '';
                });
            }
            recalculateActiveResults();
        });
    }

    // 3. Filter Model Toggles
    const btnFilterRoc = replaceWithClone('btnFilterModelRoc');
    const btnFilterProm = replaceWithClone('btnFilterModelProm');
    if (btnFilterRoc && btnFilterProm) {
        btnFilterRoc.addEventListener('click', () => {
            activeFilterModel = 'roc';
            btnFilterRoc.classList.add('active');
            btnFilterProm.classList.remove('active');
            refreshFilterAndDistViews();
        });
        btnFilterProm.addEventListener('click', () => {
            activeFilterModel = 'promethee';
            btnFilterProm.classList.add('active');
            btnFilterRoc.classList.remove('active');
            refreshFilterAndDistViews();
        });
    }

    // 4. Dist Model Toggles
    const btnDistRoc = replaceWithClone('btnDistModelRoc');
    const btnDistProm = replaceWithClone('btnDistModelProm');
    if (btnDistRoc && btnDistProm) {
        btnDistRoc.addEventListener('click', () => {
            activeDistModel = 'roc';
            btnDistRoc.classList.add('active');
            btnDistProm.classList.remove('active');
            refreshFilterAndDistViews();
        });
        btnDistProm.addEventListener('click', () => {
            activeDistModel = 'promethee';
            btnDistProm.classList.add('active');
            btnDistRoc.classList.remove('active');
            refreshFilterAndDistViews();
        });
    }

    // 5. Dist Type Toggles
    const btnDistCurve = replaceWithClone('btnDistTypeCurve');
    const btnDistRange = replaceWithClone('btnDistTypeRange');
    if (btnDistCurve && btnDistRange) {
        btnDistCurve.addEventListener('click', () => {
            activeDistType = 'curve';
            btnDistCurve.classList.add('active');
            btnDistRange.classList.remove('active');
            refreshFilterAndDistViews();
        });
        btnDistRange.addEventListener('click', () => {
            activeDistType = 'range';
            btnDistRange.classList.add('active');
            btnDistCurve.classList.remove('active');
            refreshFilterAndDistViews();
        });
    }

    function refreshFilterAndDistViews() {
        const totalCases = activeFilterModel === 'roc' ? data.roc.totalCases : data.promethee.totalCases;
        const matchingIndices = Array.from({length: totalCases}, (_, i) => i);
        updateFilterView(matchingIndices, false);
        
        const distTotalCases = activeDistModel === 'roc' ? data.roc.totalCases : data.promethee.totalCases;
        const distMatchingIndices = Array.from({length: distTotalCases}, (_, i) => i);
        updateDistView(distMatchingIndices, false);
    }

    // 6. Init holistic filter panel
    initFilterHolistic(data);

    // 7. Initial calculation of filter and distribution views
    refreshFilterAndDistViews();

    // 8. Restart Elicitation button on Final Results screen
    const btnRestartFinal = replaceWithClone('btnRestartElicitationFinal');
    if (btnRestartFinal) {
        btnRestartFinal.addEventListener('click', () => {
            activeFilters = Array(numCrit).fill(null);
            activeHolisticFilters = [];
            activeDecompositionPreferences = [];
            excludedDecompositionPairs = [];
            lastASResult = null;
            const list = document.getElementById('filterHolisticList');
            if (list) list.innerHTML = '';
            const warnEl = document.getElementById('holisticWarning');
            if (warnEl) warnEl.style.display = 'none';
            selectedHolisticRowId = null;
            if (typeof window.updateConsequenceComparison === 'function') {
                window.updateConsequenceComparison();
            }
            
            const decompList = document.getElementById('decompositionActiveList');
            if (decompList) decompList.innerHTML = '';
            const decompWarnEl = document.getElementById('decompositionWarning');
            if (decompWarnEl) decompWarnEl.style.display = 'none';
            
            recalculateActiveResults('tabElicitation');
        });
    }

    // 8b. Init Sensitivity Analysis Features
    initSensitivityAnalysisFeatures();

    // 8c. Init Decomposition Elicitation
    initDecompositionElicitation(data);

    // 9. Convergence Check
    // Use the backend's decompositionQuestion signal as the authoritative convergence indicator:
    // - If decompositionQuestion is non-null, the solver found a question to ask → show Elicitation
    // - If decompositionQuestion is null/undefined, no more questions available → solver has converged → show Final Results
    const hasNextQuestion = data.decompositionQuestion !== null && data.decompositionQuestion !== undefined;
    
    if (!hasNextQuestion) {
        // No more questions: show the winner (first solution with highest frequency, or unique solution)
        const rationality = data.rationality || 'compensatory';
        const model = rationality === 'compensatory' ? 'roc' : 'promethee';
        const uniqueSols = data[model].matrizSol;
        const resultSol = data[model].resultSol;
        
        // Pick the solution with the highest frequency as the "winner"
        let winnerProfile = uniqueSols[0];
        if (uniqueSols.length > 1 && resultSol) {
            let maxFreq = -1;
            let maxIdx = 0;
            for (let i = 0; i < resultSol.length; i++) {
                if (resultSol[i] > maxFreq) { maxFreq = resultSol[i]; maxIdx = i; }
            }
            winnerProfile = uniqueSols[maxIdx];
        }
        showFinalResults(winnerProfile);
    } else {
        showPartialAndElicitation();
    }
}

// ── HOLISTIC FILTER PANEL (results page) ─────────────────────────────────────
window.solutionAltsData = [];
window.syncHolisticRowSelects = function(row, val1, val2) {
    console.log("syncHolisticRowSelects called with:", row ? row.id : "null", "val1:", val1, "val2:", val2);
    if (!row) return;
    const select1 = row.querySelector('.holistic-flt-alt1');
    const select2 = row.querySelector('.holistic-flt-alt2');
    if (!select1 || !select2) {
        console.log("select1 or select2 not found inside row:", row.id);
        return;
    }
    
    // Retrieve target values as string representations
    let v1 = (val1 !== undefined && val1 !== null) ? String(val1) : select1.value;
    let v2 = (val2 !== undefined && val2 !== null) ? String(val2) : select2.value;
    console.log("Determined v1:", v1, "v2:", v2);
    
    // Get base solution alternatives
    let s1Alts = (window.solutionAltsData || []).slice();
    
    // Preserve current selection v1 in select1 options even if its probability is 0
    if (v1 !== "" && v1 !== undefined && v1 !== null && v1 !== 'fictitious') {
        if (!s1Alts.some(a => String(a.idx) === v1)) {
            const idxInt = parseInt(v1);
            if (!isNaN(idxInt) && currentResultsData && currentResultsData.nomesAlt && currentResultsData.nomesAlt[idxInt]) {
                s1Alts.push({ name: currentResultsData.nomesAlt[idxInt], idx: idxInt });
            }
        }
    }
    
    // Build select1 HTML: filter out fictitious and filter out v2 to prevent comparing same alternative
    select1.innerHTML = s1Alts
        .filter(a => String(a.idx) !== v2)
        .map(a => {
            const isSel = String(a.idx) === v1 ? 'selected' : '';
            return `<option value="${a.idx}" ${isSel}>${a.name}</option>`;
        })
        .join('');
        
    // If select1 value is empty (no option matched v1), default to first option
    if (select1.value === "" && select1.options.length > 0) {
        select1.selectedIndex = 0;
    }
    
    const finalVal1 = select1.value;
    console.log("select1 final value:", finalVal1);
    
    // Get base solution alternatives for select2
    let s2Alts = (window.solutionAltsData || []).slice();
    
    // Preserve current selection v2 in select2 options even if its probability is 0
    if (v2 !== "" && v2 !== undefined && v2 !== null && v2 !== 'fictitious') {
        if (!s2Alts.some(a => String(a.idx) === v2)) {
            const idxInt = parseInt(v2);
            if (!isNaN(idxInt) && currentResultsData && currentResultsData.nomesAlt && currentResultsData.nomesAlt[idxInt]) {
                s2Alts.push({ name: currentResultsData.nomesAlt[idxInt], idx: idxInt });
            }
        }
    }
    
    const lang = localStorage.getItem('spear_lang') || 'en';
    const fictVal = getFictitiousAltValue();
    const fictLabel = lang === 'pt' 
        ? `Alternativa Fictícia (Mín. Sol.: ${fictVal.toFixed(4)})` 
        : `Fictitious Alternative (Min. Sol.: ${fictVal.toFixed(4)})`;
        
    // Build select2 options. First is the fictitious alternative.
    let html2 = `<option value="fictitious" ${v2 === 'fictitious' ? 'selected' : ''}>${fictLabel}</option>`;
    
    // Followed by real alternatives (excluding finalVal1)
    html2 += s2Alts
        .filter(a => String(a.idx) !== finalVal1)
        .map(a => {
            const isSel = String(a.idx) === v2 ? 'selected' : '';
            return `<option value="${a.idx}" ${isSel}>${a.name}</option>`;
        })
        .join('');
        
    select2.innerHTML = html2;
    
    // If select2 value is empty, default to fictitious
    if (select2.value === "") {
        select2.value = "fictitious";
    }
    
    console.log("select2 final value:", select2.value);
};

window.onHolisticSelectChange = function(rowId, isAlt1Change) {
    const row = document.getElementById(rowId);
    if (!row) return;
    
    if (isAlt1Change) {
        // Force select2 to default to fictitious
        window.syncHolisticRowSelects(row, null, "fictitious");
    } else {
        window.syncHolisticRowSelects(row);
    }
    
    window.selectHolisticRow(rowId);
};

window.onHolisticRelationChange = function(rowId) {
    if (window.selectedHolisticRowId === rowId) {
        window.updateConsequenceComparison();
    }
};

window.deleteHolisticRow = function(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        if (window.selectedHolisticRowId === rowId) {
            window.selectedHolisticRowId = null;
            window.updateConsequenceComparison();
        }
    }
};

function updateAllHolisticSelects() {
    const list = document.getElementById('filterHolisticList');
    if (!list) return;
    const rows = list.querySelectorAll('.filter-holistic-row');
    rows.forEach(row => {
        window.syncHolisticRowSelects(row);
    });
}

function initFilterHolistic(data) {
    const nomesAlt = data.nomesAlt;
    const rationality = data.rationality || 'compensatory';
    const totalRoc = data.roc.totalCases;
    const totalProm = data.promethee.totalCases;
    const rawPoaRoc = data.raw.matrizPoa;
    const rawPoaProm = data.raw.matrizPoaPromethee;
    
    const solutionAlts = []; // [{name, idx}]
    for (let j = 0; j < nomesAlt.length; j++) {
        let canSolveRoc = false;
        let canSolveProm = false;
        // Only check the active model to prevent false inconsistency errors:
        // A preference between alternatives is only meaningful if both alternatives
        // can be solutions under the SAME decision model being used.
        for (let k = 0; k < totalRoc && !canSolveRoc; k++) { if (rawPoaRoc[k][j] === 1) canSolveRoc = true; }
        for (let k = 0; k < totalProm && !canSolveProm; k++) { if (rawPoaProm[k][j] === 1) canSolveProm = true; }
        
        // Show alternative only if it can be a solution in the active model
        const isActive = rationality === 'compensatory' ? canSolveRoc : canSolveProm;
        if (isActive) solutionAlts.push({ name: nomesAlt[j], idx: j });
    }
    
    window.solutionAltsData = solutionAlts;
    
    // Update all existing holistic selects with the new solutionAltsData
    updateAllHolisticSelects();
    
    function buildHolisticRowHtml() {
        const rowId = 'fhr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        return `<div class="holistic-row filter-holistic-row" id="${rowId}" style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; width:100%;">
            <select class="select-delphi holistic-flt-alt1" style="flex:1; min-width:110px;" onchange="window.onHolisticSelectChange('${rowId}')"></select>
            <select class="select-delphi holistic-flt-rel" style="flex:0.6; min-width:70px;" onchange="window.onHolisticRelationChange('${rowId}')">
                <option value=">=">&ge;</option>
                <option value="<=">&le;</option>
            </select>
            <select class="select-delphi holistic-flt-alt2" style="flex:1; min-width:110px;" onchange="window.onHolisticSelectChange('${rowId}')"></select>
            <button class="btn btn-compare-row" onclick="window.selectHolisticRow('${rowId}');" type="button"
                style="padding:4px 8px; background:var(--border-light); border:1px solid var(--border-color); color:var(--delphi-light-blue); font-size:12px; font-weight:700; border-radius:4px;" title="Compare consequences">📊</button>
            <button class="btn" onclick="window.deleteHolisticRow('${rowId}')" type="button" 
                style="padding:4px 8px; background:var(--border-light); border:1px solid var(--border-color); color:var(--text-danger,#ef4444); font-size:12px; font-weight:700; border-radius:4px;">✕</button>
        </div>`;
    }
    
    const list = document.getElementById('filterHolisticList');
    
    // Render existing holistic filters in the DOM on first load if any
    if (list && list.children.length === 0 && activeHolisticFilters.length > 0) {
        activeHolisticFilters.forEach(hf => {
            const newRowHtml = buildHolisticRowHtml();
            list.insertAdjacentHTML('beforeend', newRowHtml);
            const addedRow = list.lastElementChild;
            if (addedRow) {
                window.syncHolisticRowSelects(addedRow, hf.alt1Idx, hf.alt2Idx);
                // Also set the correct relation select value
                const selectRel = addedRow.querySelector('.holistic-flt-rel');
                if (selectRel) selectRel.value = hf.relation;
            }
        });
        // Select the first row by default so consequence comparison is shown
        if (list.firstElementChild) {
            window.selectHolisticRow(list.firstElementChild.id);
        }
    }
    
    const btnAdd = replaceWithClone('btnAddFilterHolisticRow');
    const btnApply = replaceWithClone('btnApplyHolistic');
    const btnClear = replaceWithClone('btnClearHolistic');
    const warnEl = document.getElementById('holisticWarning');
    
    if (solutionAlts.length < 2) {
        if (list) list.innerHTML = '<p style="font-size:12px; color:var(--text-muted);">At least 2 alternatives that can be solutions are needed to define pairwise preferences.</p>';
        if (btnAdd) btnAdd.disabled = true;
        if (btnApply) btnApply.disabled = true;
        return;
    }
        if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            if (list) {
                const d1 = solutionAlts[0].idx;
                const d2 = "fictitious";
                const newRowHtml = buildHolisticRowHtml();
                list.insertAdjacentHTML('beforeend', newRowHtml);
                const addedRow = list.lastElementChild;
                if (addedRow) {
                    window.syncHolisticRowSelects(addedRow, d1, d2);
                    window.selectHolisticRow(addedRow.id);
                }
            }
        });
    }
    
    if (btnApply) {
        btnApply.addEventListener('click', () => {
            if (!list) return;
            const rows = list.querySelectorAll('.filter-holistic-row');
            const newFilters = [];
            let hasError = false;
            rows.forEach(row => {
                const alt1Idx = parseInt(row.querySelector('.holistic-flt-alt1').value);
                const relation = row.querySelector('.holistic-flt-rel').value;
                const alt2Val = row.querySelector('.holistic-flt-alt2').value;
                
                let alt2Idx;
                let fictitiousValue = null;
                
                if (alt2Val === 'fictitious') {
                    alt2Idx = 'fictitious';
                    fictitiousValue = getFictitiousAltValue();
                } else {
                    alt2Idx = parseInt(alt2Val);
                }
                
                if (alt1Idx === alt2Idx) { hasError = true; return; }
                newFilters.push({ alt1Idx, relation, alt2Idx, fictitiousValue });
            });
            if (hasError) {
                if (warnEl) { warnEl.textContent = 'Error: An alternative cannot be compared to itself.'; warnEl.style.display = 'block'; }
                return;
            }
            if (warnEl) warnEl.style.display = 'none';
            activeHolisticFilters = newFilters;
            recalculateActiveResults(true); // Recalculate and redirect to Results tab
        });
    }    
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (list) list.innerHTML = '';
            activeHolisticFilters = [];
            if (warnEl) warnEl.style.display = 'none';
            selectedHolisticRowId = null;
            window.updateConsequenceComparison();
            recalculateActiveResults(false);
        });
    }
}

// --- Consequence Comparison Widget Logic ---

window.selectHolisticRow = function(rowId) {
    // Remove highlight from all rows
    document.querySelectorAll('.filter-holistic-row').forEach(row => {
        row.classList.remove('selected-holistic-row');
    });
    // Highlight the selected row
    const selectedRow = document.getElementById(rowId);
    if (selectedRow) {
        selectedRow.classList.add('selected-holistic-row');
    }
    selectedHolisticRowId = rowId;
    window.updateConsequenceComparison();
};

window.setConsequenceView = function(viewType, event) {
    activeConsequenceView = viewType;
    // Update subtab active classes
    const card = document.getElementById('consequenceComparisonCard');
    if (card) {
        const links = card.querySelectorAll('.subtab-link');
        links.forEach(l => l.classList.remove('active'));
    }
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    window.updateConsequenceComparison();
};

window.updateConsequenceComparison = function() {
    const placeholder = document.getElementById('consequenceComparisonPlaceholder');
    const content = document.getElementById('consequenceComparisonContent');
    if (!placeholder || !content) return;

    if (!selectedHolisticRowId) {
        placeholder.style.display = 'flex';
        content.style.display = 'none';
        return;
    }

    const row = document.getElementById(selectedHolisticRowId);
    if (!row) {
        selectedHolisticRowId = null;
        placeholder.style.display = 'flex';
        content.style.display = 'none';
        return;
    }

    const select1 = row.querySelector('.holistic-flt-alt1');
    const select2 = row.querySelector('.holistic-flt-alt2');
    const relSelect = row.querySelector('.holistic-flt-rel');
    if (!select1 || !select2) return;

    const alt1Idx = parseInt(select1.value);
    const alt2Val = select2.value; // string or number
    const relation = relSelect ? relSelect.value : '>=';

    const res = currentResultsData;
    if (!res || !res.matrizConseq) return;

    placeholder.style.display = 'none';
    content.style.display = 'flex';

    const alt1Name = res.nomesAlt[alt1Idx];
    const isFictitious = (alt2Val === 'fictitious');
    const alt2Name = isFictitious 
        ? (localStorage.getItem('spear_lang') === 'pt' ? 'Alternativa Fictícia' : 'Fictitious Alternative')
        : res.nomesAlt[parseInt(alt2Val)];
    const relLabel = relation === '>=' ? '≥' : '≤';
    
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    document.getElementById('consequenceComparisonTitle').textContent = `${dict.comparing_alts_prefix || 'Comparing: '}${alt1Name} ${relLabel} ${alt2Name}`;

    renderConsequenceComparison(alt1Idx, alt2Val);
};

function renderConsequenceComparison(alt1Idx, alt2Val) {
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    const res = currentResultsData;
    const originalMatrix = res.matrizConseq;
    const normalizedMatrix = res.matrizConseqNorm;
    const nomesCrit = res.nomesCrit;
    const tipoCrit = res.tipoCrit || Array(nomesCrit.length).fill(0);
    const alt1Name = res.nomesAlt[alt1Idx];
    
    const isFictitious = (alt2Val === 'fictitious');
    const alt2Idx = isFictitious ? -1 : parseInt(alt2Val);
    const alt2Name = isFictitious 
        ? (lang === 'pt' ? 'Alternativa Fictícia' : 'Fictitious Alternative')
        : res.nomesAlt[alt2Idx];

    const fictValue = isFictitious ? getFictitiousAltValue() : 0;

    const normVals1 = normalizedMatrix[alt1Idx];
    const normVals2 = isFictitious 
        ? Array(nomesCrit.length).fill(fictValue)
        : normalizedMatrix[alt2Idx];

    const originalVals1 = originalMatrix[alt1Idx];
    const originalVals2 = isFictitious
        ? nomesCrit.map((_, i) => denormalizeCriterionValue(i, fictValue))
        : originalMatrix[alt2Idx];

    // Cleanup previous chart
    if (consequenceChartInstance) {
        consequenceChartInstance.destroy();
        consequenceChartInstance = null;
    }

    const chartCanvas = document.getElementById('consequenceChart');
    const tableContainer = document.getElementById('consequenceTableContainer');

    if (activeConsequenceView === 'table') {
        chartCanvas.parentNode.style.display = 'none';
        tableContainer.style.display = 'block';

        // Build comparison table HTML
        let html = `<table class="consequence-comp-table">
            <thead>
                <tr>
                    <th style="text-align:left;">${dict.crit_col || 'Criterion'}</th>
                    <th>${dict.type_col || 'Type'}</th>
                    <th>${alt1Name}</th>
                    <th>${alt2Name}</th>
                    <th>${dict.diff_col || 'Diff'}</th>
                    <th>${dict.better_col || 'Better'}</th>
                </tr>
            </thead>
            <tbody>`;

        const typeLabels = {
            0: dict.crit_type_cont_min,
            1: dict.crit_type_cont_max,
            2: dict.crit_type_disc_min,
            3: dict.crit_type_disc_max,
            4: dict.crit_type_int_min,
            5: dict.crit_type_int_max
        };

        for (let i = 0; i < nomesCrit.length; i++) {
            const val1 = originalVals1[i];
            const val2 = originalVals2[i];
            const diff = val1 - val2;
            const tipo = tipoCrit[i];
            const isMin = (tipo === 0 || tipo === 2 || tipo === 4);

            let diffText = diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
            if (diff === 0) diffText = "0.00";

            let betterAlt = '';
            if (Math.abs(diff) < 1e-9) {
                betterAlt = `<span class="comp-equal">${dict.tie || 'Tie'}</span>`;
            } else if (isMin) {
                betterAlt = diff < 0 ? `<span class="comp-better">${alt1Name}</span>` : `<span class="comp-better">${alt2Name}</span>`;
            } else {
                betterAlt = diff > 0 ? `<span class="comp-better">${alt1Name}</span>` : `<span class="comp-better">${alt2Name}</span>`;
            }

            html += `<tr>
                <td class="text-left">${nomesCrit[i]}</td>
                <td>${typeLabels[tipo] || 'Cont. Min.'}</td>
                <td style="font-weight:600;">${val1.toFixed(2)}</td>
                <td style="font-weight:600;">${val2.toFixed(2)}</td>
                <td style="color:${diff === 0 ? 'var(--text-muted)' : (diff > 0 ? '#15803d' : '#b91c1c')}; font-weight:600;">${diffText}</td>
                <td>${betterAlt}</td>
            </tr>`;
        }

        html += `</tbody></table>`;
        tableContainer.innerHTML = html;
    } else {
        chartCanvas.parentNode.style.display = 'block';
        tableContainer.style.display = 'none';

        const ctx = chartCanvas.getContext('2d');

        if (activeConsequenceView === 'bar') {
            consequenceChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: nomesCrit,
                    datasets: [
                        {
                            label: alt1Name,
                            data: normVals1,
                            backgroundColor: 'rgba(37, 99, 235, 0.85)',
                            borderColor: 'rgba(37, 99, 235, 1)',
                            borderWidth: 1
                        },
                        {
                            label: alt2Name,
                            data: normVals2,
                            backgroundColor: 'rgba(245, 158, 11, 0.85)',
                            borderColor: 'rgba(245, 158, 11, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 1.05,
                            title: { display: true, text: dict.normalized_perf || 'Normalized Performance [0, 1]', font: { family: "'Inter', sans-serif", weight: 'bold' } },
                            grid: { color: 'rgba(226, 232, 240, 0.6)' },
                            ticks: { font: { family: "'Inter', sans-serif" } }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { family: "'Inter', sans-serif" } }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const isDataset0 = (context.datasetIndex === 0);
                                    const origVal = isDataset0 ? originalVals1[context.dataIndex] : originalVals2[context.dataIndex];
                                    const normVal = isDataset0 ? normVals1[context.dataIndex] : normVals2[context.dataIndex];
                                    return `${context.dataset.label}: ${origVal.toFixed(2)} (Norm: ${normVal.toFixed(2)})`;
                                }
                            }
                        }
                    }
                }
            });
        } else if (activeConsequenceView === 'line') {
            consequenceChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: nomesCrit,
                    datasets: [
                        {
                            label: alt1Name,
                            data: normVals1,
                            borderColor: 'rgba(37, 99, 235, 1)',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            borderWidth: 2.5,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            tension: 0.15
                        },
                        {
                            label: alt2Name,
                            data: normVals2,
                            borderColor: 'rgba(245, 158, 11, 1)',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderWidth: 2.5,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            tension: 0.15
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 1.05,
                            title: { display: true, text: dict.normalized_perf || 'Normalized Performance [0, 1]', font: { family: "'Inter', sans-serif", weight: 'bold' } },
                            grid: { color: 'rgba(226, 232, 240, 0.6)' },
                            ticks: { font: { family: "'Inter', sans-serif" } }
                        },
                        x: {
                            grid: { display: true, color: 'rgba(226, 232, 240, 0.3)' },
                            ticks: { font: { family: "'Inter', sans-serif" } }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const isDataset0 = (context.datasetIndex === 0);
                                    const origVal = isDataset0 ? originalVals1[context.dataIndex] : originalVals2[context.dataIndex];
                                    const normVal = isDataset0 ? normVals1[context.dataIndex] : normVals2[context.dataIndex];
                                    return `${context.dataset.label}: ${origVal.toFixed(2)} (Norm: ${normVal.toFixed(2)})`;
                                }
                            }
                        }
                    }
                }
            });
        } else if (activeConsequenceView === 'bubble') {
            const dataPoints1 = normVals1.map((val, idx) => ({ x: idx, y: val, r: val * 15 + 6 }));
            const dataPoints2 = normVals2.map((val, idx) => ({ x: idx, y: val, r: val * 15 + 6 }));

            consequenceChartInstance = new Chart(ctx, {
                type: 'bubble',
                data: {
                    datasets: [
                        {
                            label: alt1Name,
                            data: dataPoints1,
                            backgroundColor: 'rgba(37, 99, 235, 0.65)',
                            borderColor: 'rgba(37, 99, 235, 1)',
                            borderWidth: 1
                        },
                        {
                            label: alt2Name,
                            data: dataPoints2,
                            backgroundColor: 'rgba(245, 158, 11, 0.65)',
                            borderColor: 'rgba(245, 158, 11, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'linear',
                            min: -0.5,
                            max: nomesCrit.length - 0.5,
                            ticks: {
                                stepSize: 1,
                                callback: function(val) {
                                    return nomesCrit[val] || '';
                                },
                                font: { family: "'Inter', sans-serif" }
                            },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: true,
                            max: 1.1,
                            title: { display: true, text: dict.normalized_perf || 'Normalized Performance [0, 1]', font: { family: "'Inter', sans-serif", weight: 'bold' } },
                            grid: { color: 'rgba(226, 232, 240, 0.6)' },
                            ticks: { font: { family: "'Inter', sans-serif" } }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const isDataset0 = (context.datasetIndex === 0);
                                    const origVal = isDataset0 ? originalVals1[context.dataIndex] : originalVals2[context.dataIndex];
                                    const normVal = context.raw.y;
                                    return `${context.dataset.label}: ${origVal.toFixed(2)} (Norm: ${normVal.toFixed(2)})`;
                                }
                            }
                        }
                    }
                }
            });
        } else if (activeConsequenceView === 'radar') {
            consequenceChartInstance = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: nomesCrit,
                    datasets: [
                        {
                            label: alt1Name,
                            data: normVals1,
                            backgroundColor: 'rgba(37, 99, 235, 0.25)',
                            borderColor: 'rgba(37, 99, 235, 1)',
                            pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                            borderWidth: 2
                        },
                        {
                            label: alt2Name,
                            data: normVals2,
                            backgroundColor: 'rgba(245, 158, 11, 0.25)',
                            borderColor: 'rgba(245, 158, 11, 1)',
                            pointBackgroundColor: 'rgba(245, 158, 11, 1)',
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: { display: true, color: 'rgba(226, 232, 240, 0.8)' },
                            grid: { color: 'rgba(226, 232, 240, 0.8)' },
                            suggestedMin: 0,
                            suggestedMax: 1,
                            ticks: {
                                backdropColor: 'transparent',
                                font: { size: 9 }
                            },
                            pointLabels: {
                                font: { family: "'Inter', sans-serif", weight: 'bold', size: 11 }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const isDataset0 = (context.datasetIndex === 0);
                                    const origVal = isDataset0 ? originalVals1[context.dataIndex] : originalVals2[context.dataIndex];
                                    return `${context.dataset.label}: ${origVal.toFixed(2)} (Norm: ${context.raw.toFixed(2)})`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }
}

function applyFiltersAndRecalculate(model) {
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    const modelData = currentResultsData[model];
    const totalCases = modelData.totalCases;
    const numCrit = currentResultsData.nomesCrit.length;
    const casesOrdemCrit = model === 'roc' ? currentResultsData.raw.casesOrdemCritRoc : currentResultsData.raw.casesOrdemCritPromethee;
    
    // Raw global values for holistic filtering (resultado_roc or resultado_promethee)
    const resultadoRaw = model === 'roc' ? currentResultsData.raw.resultadoRoc : currentResultsData.raw.resultadoPromethee;

    // Check if there are filter conflicts (e.g. same criterion selected for multiple positions)
    const selectedVals = activeFilters.filter(v => v !== null);
    const hasConflicts = (new Set(selectedVals)).size !== selectedVals.length;

    let matchingIndices = [];
    if (!hasConflicts && casesOrdemCrit) {
        for (let k = 0; k < totalCases; k++) {
            let isMatch = true;
            
            // 1. Rank position filter
            for (let p = 0; p < numCrit; p++) {
                const critIdx = activeFilters[p];
                if (critIdx !== null) {
                    if (casesOrdemCrit[k][critIdx] !== (p + 1)) {
                        isMatch = false;
                        break;
                    }
                }
            }
            
            // 2. Holistic pairwise filter
            if (isMatch && activeHolisticFilters.length > 0 && resultadoRaw) {
                for (const hf of activeHolisticFilters) {
                    const val1 = resultadoRaw[k][hf.alt1Idx];
                    let val2;
                    if (hf.alt2Idx === 'fictitious') {
                        val2 = hf.fictitiousValue !== null && hf.fictitiousValue !== undefined 
                            ? hf.fictitiousValue 
                            : getFictitiousAltValue();
                    } else {
                        val2 = resultadoRaw[k][hf.alt2Idx];
                    }
                    if (hf.relation === '>=' && val1 < val2 - 1e-9) { isMatch = false; break; }
                    if (hf.relation === '<=' && val1 > val2 + 1e-9) { isMatch = false; break; }
                }
            }
            
            if (isMatch) matchingIndices.push(k);
        }
    }

    // Update filter status display
    if (model === activeFilterModel) {
        const matchCountEl = document.getElementById('filterMatchingCount');
        const matchPctEl = document.getElementById('filterMatchingPct');
        const warningEl = document.getElementById('filterWarning');

        if (hasConflicts) {
            if (matchCountEl) matchCountEl.textContent = `0 / ${totalCases}`;
            if (matchPctEl) matchPctEl.textContent = '0.0%';
            if (warningEl) {
                warningEl.textContent = dict.conflict_filter || 'Conflict: The same criterion cannot be selected for multiple positions.';
                warningEl.style.display = 'block';
            }
        } else {
            const pct = totalCases > 0 ? ((matchingIndices.length / totalCases) * 100).toFixed(1) : '0.0';
            if (matchCountEl) matchCountEl.textContent = `${matchingIndices.length} / ${totalCases}`;
            if (matchPctEl) matchPctEl.textContent = `${pct}%`;
            if (warningEl) warningEl.style.display = 'none';
        }

        updateActiveFiltersBadge();
    }

    return { matchingIndices, hasConflicts };
}

function updateActiveFiltersBadge() {
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    const badge = document.getElementById('distActiveFiltersBadge');
    if (!badge) return;

    const parts = [];
    for (let p = 0; p < activeFilters.length; p++) {
        const critIdx = activeFilters[p];
        if (critIdx !== null) {
            const critName = currentResultsData.nomesCrit[critIdx];
            const ord = getOrdinalSuffix(p + 1);
            parts.push(`${critName} ${dict.at_pos || 'at'} ${ord}`);
        }
    }

    if (parts.length === 0) {
        badge.textContent = dict.filters_none || 'Filters: None';
    } else {
        badge.textContent = `${dict.filters_badge_prefix || 'Filters: '}${parts.join(', ')}`;
    }
}

function updateFilterView(matchingIndices, hasConflicts) {
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    const tbody = document.querySelector('#filterProbTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (filterChartInstance) {
        filterChartInstance.destroy();
        filterChartInstance = null;
    }

    if (hasConflicts || !originalResultsData || !currentResultsData) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">${dict.no_compat_order || 'No compatible criteria order found.'}</td></tr>`;
        return;
    }

    const model = activeFilterModel === 'roc' ? 'roc' : 'promethee';
    const totalCasesOriginal = originalResultsData[model].totalCases;
    const totalCasesFiltered = currentResultsData[model].totalCases;
    
    if (totalCasesFiltered === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">${dict.no_solved_alts || 'No alternatives can be a solution under current filters.'}</td></tr>`;
        return;
    }

    const nomesAlt = currentResultsData.nomesAlt;
    const rawPoaOriginal = model === 'roc' ? originalResultsData.raw.matrizPoa : originalResultsData.raw.matrizPoaPromethee;
    const rawPoaFiltered = model === 'roc' ? currentResultsData.raw.matrizPoa : currentResultsData.raw.matrizPoaPromethee;

    const chartLabels = [];
    const originalProbs = [];
    const filteredProbs = [];
    let rowsHtml = '';

    for (let j = 0; j < nomesAlt.length; j++) {
        // Original prob
        let origCount = 0;
        for (let k = 0; k < totalCasesOriginal; k++) {
            if (rawPoaOriginal[k][j] === 1) origCount++;
        }
        const origProb = totalCasesOriginal > 0 ? origCount / totalCasesOriginal : 0;
        
        // Only show alternatives that can be a solution (originalProb > 0)
        if (origProb <= 0) continue;

        // Filtered prob
        let filtCount = 0;
        for (let k = 0; k < totalCasesFiltered; k++) {
            if (rawPoaFiltered[k][j] === 1) filtCount++;
        }
        const filtProb = totalCasesFiltered > 0 ? filtCount / totalCasesFiltered : 0;

        const diff = filtProb - origProb;
        const origProbPct = (origProb * 100).toFixed(1) + '%';
        const filtProbPct = (filtProb * 100).toFixed(1) + '%';
        const diffPct = (diff * 100).toFixed(1);
        
        let badgeClass = 'diff-zero';
        let diffText = '0.0%';
        if (diff > 0.0001) { badgeClass = 'diff-positive'; diffText = `+${diffPct}%`; }
        else if (diff < -0.0001) { badgeClass = 'diff-negative'; diffText = `${diffPct}%`; }

        rowsHtml += `<tr>
            <td style="font-weight:600; text-align:left;">${nomesAlt[j]}</td>
            <td>${origProbPct}</td>
            <td style="color:var(--delphi-light-blue); font-weight:700;">${filtProbPct}</td>
            <td><span class="diff-badge ${badgeClass}">${diffText}</span></td>
        </tr>`;
        
        chartLabels.push(nomesAlt[j]);
        originalProbs.push(origProb);
        filteredProbs.push(filtProb);
    }
    
    tbody.innerHTML = rowsHtml || `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">${dict.no_solved_alts || 'No alternatives can be a solution under current filters.'}</td></tr>`;

    const ctx = document.getElementById('filterChart').getContext('2d');
    filterChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: dict.original_prob || 'Original Prob',
                    data: originalProbs.map(p => p * 100),
                    backgroundColor: 'rgba(148, 163, 184, 0.5)',
                    borderColor: 'rgba(148, 163, 184, 1)',
                    borderWidth: 1
                },
                {
                    label: dict.filtered_prob || 'Filtered Prob',
                    data: filteredProbs.map(p => p * 100),
                    backgroundColor: activeFilterModel === 'roc' ? 'rgba(37, 99, 235, 0.8)' : 'rgba(16, 185, 129, 0.8)',
                    borderColor: activeFilterModel === 'roc' ? 'rgba(37, 99, 235, 1)' : 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: dict.prob_pct || 'Probability (%)',
                        font: { family: "'Inter', sans-serif", weight: 'bold' }
                    },
                    grid: { color: 'rgba(226, 232, 240, 0.6)' },
                    ticks: {
                        color: '#64748b',
                        font: { family: "'Inter', sans-serif" }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#64748b',
                        font: { family: "'Inter', sans-serif" }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { family: "'Inter', sans-serif" }
                    }
                }
            }
        }
    });
}

function updateDistView(matchingIndices, hasConflicts) {
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    const checkboxContainer = document.getElementById('distAltCheckboxes');
    if (!checkboxContainer) return;

    if (hasConflicts || matchingIndices.length === 0) {
        checkboxContainer.innerHTML = `<span style="color:var(--text-muted); font-size:11px;">${dict.no_compat_order || 'No compatible criteria order found.'}</span>`;
        drawDistributions(matchingIndices, hasConflicts);
        return;
    }

    const nomesAlt = currentResultsData.nomesAlt;
    const rawPoa = activeDistModel === 'roc' ? currentResultsData.raw.matrizPoa : currentResultsData.raw.matrizPoaPromethee;

    // Find solved alternatives (probability > 0 under current filters)
    const solvedAlts = [];
    for (let j = 0; j < nomesAlt.length; j++) {
        let isSolved = false;
        for (let k of matchingIndices) {
            if (rawPoa[k][j] === 1) {
                isSolved = true;
                break;
            }
        }
        if (isSolved) {
            solvedAlts.push({ index: j, name: nomesAlt[j] });
        }
    }

    // Read currently checked alternative names to preserve state
    const currentCheckedNames = new Set();
    const existingCheckboxes = checkboxContainer.querySelectorAll('input[type="checkbox"]');
    existingCheckboxes.forEach(cb => {
        if (cb.checked) {
            currentCheckedNames.add(cb.getAttribute('data-name'));
        }
    });

    const solvedNames = solvedAlts.map(a => a.name);
    const hasOverlap = solvedNames.some(name => currentCheckedNames.has(name));

    // Clear and rebuild checkboxes
    checkboxContainer.innerHTML = '';
    if (solvedAlts.length === 0) {
        checkboxContainer.innerHTML = `<span style="color:var(--text-muted); font-size:11px;">${dict.no_solved_alts || 'No solved alternatives under current filters.'}</span>`;
    } else {
        solvedAlts.forEach(alt => {
            const label = document.createElement('label');
            label.style.display = 'inline-flex';
            label.style.alignItems = 'center';
            label.style.gap = '4px';
            label.style.fontSize = '12px';
            label.style.fontWeight = '600';
            label.style.cursor = 'pointer';
            
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.setAttribute('data-name', alt.name);
            cb.setAttribute('data-index', alt.index);
            
            // Check if it should be checked
            if (!hasOverlap || currentCheckedNames.has(alt.name)) {
                cb.checked = true;
            }
            
            cb.addEventListener('change', () => {
                drawDistributions(matchingIndices, hasConflicts);
            });
            
            label.appendChild(cb);
            label.appendChild(document.createTextNode(alt.name));
            checkboxContainer.appendChild(label);
        });
    }

    // Now render the chart and table
    drawDistributions(matchingIndices, hasConflicts);
}

function drawDistributions(matchingIndices, hasConflicts) {
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    const tbody = document.querySelector('#distStatsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (distChartInstance) {
        distChartInstance.destroy();
        distChartInstance = null;
    }

    if (hasConflicts || matchingIndices.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">${dict.no_compat_order || 'No compatible criteria order found.'}</td></tr>`;
        return;
    }

    // Get checked alternative indices
    const checkedAlts = [];
    const cbElems = document.querySelectorAll('#distAltCheckboxes input[type="checkbox"]');
    cbElems.forEach(cb => {
        if (cb.checked) {
            checkedAlts.push({
                index: parseInt(cb.getAttribute('data-index')),
                name: cb.getAttribute('data-name')
            });
        }
    });

    if (checkedAlts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">${dict.select_alt_display || 'Select at least one alternative to display.'}</td></tr>`;
        return;
    }

    // Choose values matrix
    let rawVals;
    if (activeDistModel === 'roc') {
        rawVals = currentResultsData.raw.resultadoRoc;
        document.getElementById('distChartTitle').textContent = dict.dist_roc_title || 'Global Values (ROC) Distribution';
    } else {
        rawVals = currentResultsData.raw.resultadoPromethee;
        document.getElementById('distChartTitle').textContent = dict.dist_prom_title || 'Net Outranking Flows (PROMETHEE) Distribution';
    }

    const stats = [];
    const allValues = [];

    checkedAlts.forEach(alt => {
        const altVals = matchingIndices.map(k => rawVals[k][alt.index]);
        altVals.sort((a, b) => a - b);
        allValues.push(altVals);

        const minVal = altVals[0];
        const maxVal = altVals[altVals.length - 1];
        const avgVal = altVals.reduce((a, b) => a + b, 0) / altVals.length;
        const stdDev = Math.sqrt(altVals.reduce((sum, val) => sum + Math.pow(val - avgVal, 2), 0) / altVals.length);

        stats.push({
            name: alt.name,
            min: minVal,
            max: maxVal,
            avg: avgVal,
            std: stdDev
        });

        tbody.innerHTML += `
            <tr>
                <td style="font-weight:600; text-align:left;">${alt.name}</td>
                <td style="color:#b91c1c; font-weight:600;">${minVal.toFixed(4)}</td>
                <td style="color:var(--delphi-light-blue); font-weight:700;">${avgVal.toFixed(4)}</td>
                <td style="color:#15803d; font-weight:600;">${maxVal.toFixed(4)}</td>
                <td style="color:var(--text-muted); font-weight:500;">${stdDev.toFixed(4)}</td>
            </tr>
        `;
    });

    const ctx = document.getElementById('distChart').getContext('2d');
    
    if (activeDistType === 'curve') {
        // Value Profile Curves: Line Chart
        const numPoints = Math.min(matchingIndices.length, 100);
        const datasets = [];

        checkedAlts.forEach((alt, idx) => {
            const sampled = sampleArray(allValues[idx], numPoints);
            datasets.push({
                label: alt.name,
                data: sampled,
                borderColor: chartColors[alt.index % chartColors.length],
                backgroundColor: 'transparent',
                borderWidth: 2.5,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.1
            });
        });

        const labels = Array.from({ length: numPoints }, (_, i) => {
            if (numPoints <= 1) return '0%';
            return ((i / (numPoints - 1)) * 100).toFixed(0) + '%';
        });

        distChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: activeDistModel === 'roc' ? (dict.utility || 'Utility') : (dict.net_flow || 'Net Flow'),
                            font: { family: "'Inter', sans-serif", weight: 'bold' }
                        },
                        grid: { color: 'rgba(226, 232, 240, 0.6)' },
                        ticks: {
                            color: '#64748b',
                            font: { family: "'Inter', sans-serif" }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: dict.percentile_perms || 'Percentile of Permutations (%)',
                            font: { family: "'Inter', sans-serif", weight: 'bold' }
                        },
                        grid: { color: 'rgba(226, 232, 240, 0.3)' },
                        ticks: {
                            color: '#64748b',
                            font: { family: "'Inter', sans-serif" }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: { family: "'Inter', sans-serif" }
                        }
                    }
                }
            }
        });

    } else {
        // Range Bar Chart (floating bars)
        const barData = stats.map(s => [s.min, s.max]);
        const avgData = stats.map(s => s.avg);
        const labels = checkedAlts.map(alt => alt.name);

        distChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: dict.val_range || 'Value Range [Min, Max]',
                        data: barData,
                        backgroundColor: activeDistModel === 'roc' ? 'rgba(37, 99, 235, 0.35)' : 'rgba(16, 185, 129, 0.35)',
                        borderColor: activeDistModel === 'roc' ? 'rgba(37, 99, 235, 1)' : 'rgba(16, 185, 129, 1)',
                        borderWidth: 1.5,
                        borderRadius: 4
                    },
                    {
                        label: dict.avg || 'Average (μ)',
                        data: avgData,
                        type: 'line',
                        showLine: false,
                        backgroundColor: '#ef4444',
                        borderColor: '#ef4444',
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: activeDistModel === 'roc' ? (dict.utility || 'Utility') : (dict.net_flow || 'Net Flow'),
                            font: { family: "'Inter', sans-serif", weight: 'bold' }
                        },
                        grid: { color: 'rgba(226, 232, 240, 0.6)' },
                        ticks: {
                            color: '#64748b',
                            font: { family: "'Inter', sans-serif" }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: '#64748b',
                            font: { family: "'Inter', sans-serif" }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: { family: "'Inter', sans-serif" }
                        }
                    }
                }
            }
        });
    }
}

function getOrdinalSuffix(num) {
    const lang = localStorage.getItem('spear_lang') || 'en';
    if (lang === 'pt') return num + "º";
    const j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return num + "st";
    if (j === 2 && k !== 12) return num + "nd";
    if (j === 3 && k !== 13) return num + "rd";
    return num + "th";
}

function sampleArray(arr, maxPoints = 100) {
    if (arr.length <= maxPoints) return arr;
    const step = (arr.length - 1) / (maxPoints - 1);
    const sampled = [];
    for (let i = 0; i < maxPoints; i++) {
        sampled.push(arr[Math.round(i * step)]);
    }
    return sampled;
}

// ----------- HOLISTIC PREFERENCES HELPERS -----------

function getFictitiousAltValue() {
    const data = currentResultsData;
    if (!data) return 0;
    const rationality = data.rationality || 'compensatory';
    const isComp = (rationality === 'compensatory');
    const rawVals = isComp ? data.raw.resultadoRoc : data.raw.resultadoPromethee;
    
    if (!rawVals || rawVals.length === 0) return 0;
    
    let minGlobalVal = Infinity;
    for (let k = 0; k < rawVals.length; k++) {
        let maxInCase = -Infinity;
        for (let j = 0; j < rawVals[k].length; j++) {
            if (rawVals[k][j] > maxInCase) {
                maxInCase = rawVals[k][j];
            }
        }
        if (maxInCase < minGlobalVal) {
            minGlobalVal = maxInCase;
        }
    }
    return minGlobalVal === Infinity ? 0 : minGlobalVal;
}

function denormalizeCriterionValue(i, normVal) {
    const data = currentResultsData;
    if (!data) return 0;
    const range = getCriterionRange(i);
    const minVal = range.minVal;
    const maxVal = range.maxVal;
    const type = data.tipoCrit[i];
    const isMin = (type === 0 || type === 2 || type === 4);
    
    const denominator = maxVal - minVal;
    if (denominator === 0) return minVal;
    
    if (isMin) {
        return maxVal - normVal * denominator;
    } else {
        return minVal + normVal * denominator;
    }
}

function getAlternativesList() {
    return Array.from(document.querySelectorAll('.alt-name')).map(i => i.value.trim());
}

function updateHolisticDropdowns() {
    const alts = getAlternativesList();
    const rows = document.querySelectorAll('#holisticList .holistic-row');
    rows.forEach(row => {
        const select1 = row.querySelector('.alt1-select');
        const select2 = row.querySelector('.alt2-select');
        if (!select1 || !select2) return;
        
        const val1 = select1.value;
        const val2 = select2.value;
        
        // Clear options
        select1.innerHTML = '';
        select2.innerHTML = '';
        
        alts.forEach(altName => {
            const opt1 = document.createElement('option');
            opt1.value = altName;
            opt1.textContent = altName;
            select1.appendChild(opt1);
            
            const opt2 = document.createElement('option');
            opt2.value = altName;
            opt2.textContent = altName;
            select2.appendChild(opt2);
        });
        
        // Restore values if still present
        if (alts.includes(val1)) select1.value = val1;
        if (alts.includes(val2)) select2.value = val2;
    });
}

function addHolisticRow(savedData = null) {
    const container = document.getElementById('holisticList');
    if (!container) return;
    
    const alts = getAlternativesList();
    
    const row = document.createElement('div');
    row.className = 'holistic-row';
    
    // Alt 1 select
    const select1 = document.createElement('select');
    select1.className = 'holistic-select alt1-select';
    
    // Relation select
    const selectRel = document.createElement('select');
    selectRel.className = 'holistic-select rel-select';
    selectRel.style.flex = '0 0 60px';
    const optGe = document.createElement('option');
    optGe.value = '>=';
    optGe.textContent = '≥';
    const optLe = document.createElement('option');
    optLe.value = '<=';
    optLe.textContent = '≤';
    selectRel.appendChild(optGe);
    selectRel.appendChild(optLe);
    
    // Alt 2 select
    const select2 = document.createElement('select');
    select2.className = 'holistic-select alt2-select';
    
    // Populate options
    alts.forEach(altName => {
        const opt1 = document.createElement('option');
        opt1.value = altName;
        opt1.textContent = altName;
        select1.appendChild(opt1);
        
        const opt2 = document.createElement('option');
        opt2.value = altName;
        opt2.textContent = altName;
        select2.appendChild(opt2);
    });
    
    // Delete button
    const btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'btn-delete-row';
    btnDel.innerHTML = '🗑️';
    btnDel.addEventListener('click', () => {
        row.remove();
    });
    
    row.appendChild(select1);
    row.appendChild(selectRel);
    row.appendChild(select2);
    row.appendChild(btnDel);
    
    container.appendChild(row);
    
    // If saved data, restore it
    if (savedData) {
        if (alts.includes(savedData.alt1)) select1.value = savedData.alt1;
        selectRel.value = savedData.relation;
        if (alts.includes(savedData.alt2)) select2.value = savedData.alt2;
    } else {
        // default select different alternatives if available
        if (alts.length >= 2) {
            select2.value = alts[1];
        }
    }
}

function getHolisticEvaluationsPayload() {
    const list = [];
    const rows = document.querySelectorAll('.holistic-row');
    rows.forEach(row => {
        const select1 = row.querySelector('.alt1-select');
        const selectRel = row.querySelector('.rel-select');
        const select2 = row.querySelector('.alt2-select');
        if (select1 && select2 && selectRel) {
            const alt1 = select1.value;
            const relation = selectRel.value;
            const alt2 = select2.value;
            if (alt1 && alt2 && relation) {
                list.push({ alt1, relation, alt2 });
            }
        }
    });
    return list;
}

function drawSwingChart() {
    const canvas = document.getElementById('swingChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (swingChartInstance) {
        swingChartInstance.destroy();
        swingChartInstance = null;
    }
    
    const numCrit = currentResultsData.nomesCrit.length;
    const bestValues = [];
    const worstValues = [];
    const maxValues = [];
    const currentValues = [];
    const percentages = [];
    const isMinArray = [];
    
    const weights = getRocWeights(numCrit);
    const w_0 = weights[0];
    
    for (let j = 0; j < numCrit; j++) {
        const colValues = currentResultsData.matrizConseq.map(row => row[j]);
        const maxVal = Math.max(...colValues);
        const minVal = Math.min(...colValues);
        const isMin = (currentResultsData.tipoCrit[j] % 2 === 0);
        
        const best = isMin ? minVal : maxVal;
        const worst = isMin ? maxVal : minVal;
        
        bestValues.push(best);
        worstValues.push(worst);
        maxValues.push(maxVal);
        isMinArray.push(isMin);
        
        // Find position of this criterion in activeFilters
        const p = activeFilters.indexOf(j);
        let H_j = 0; // relative swing importance (0 to 100)
        
        if (p !== -1) {
            const w_p = weights[p];
            H_j = (w_p / w_0) * 100;
        }
        
        // Consequence value corresponding to the swing:
        // V_j = worst + (H_j / 100) * (best - worst)
        const rawVal = worst + (H_j / 100.0) * (best - worst);
        
        let val;
        // Format number nicely to avoid long decimal strings
        if (Number.isInteger(best) && Number.isInteger(worst)) {
            val = Math.round(rawVal);
        } else {
            val = parseFloat(rawVal.toFixed(2));
        }
        currentValues.push(val);
        
        // Height of the bar on the scale [0, maxVal]:
        let pct = 0;
        if (maxVal > 0) {
            pct = (val / maxVal) * 100;
        }
        percentages.push(pct);
    }
    
    const swingLabelPlugin = {
        id: 'swingLabels',
        afterDatasetsDraw(chart, args, options) {
            const { ctx, chartArea: { top, bottom } } = chart;
            ctx.save();
            ctx.font = "600 10px 'Inter', sans-serif";
            ctx.textAlign = 'center';
            
            const bests = options.bests || [];
            const worsts = options.worsts || [];
            const currentVals = options.currentVals || [];
            const isMins = options.isMins || [];
            
            const meta = chart.getDatasetMeta(0);
            meta.data.forEach((bar, index) => {
                if (!bar) return;
                const xPos = bar.x;
                
                // 1. Draw Max consequence at the top (with B: or W: prefix depending on tipo)
                const isMin = isMins[index];
                const topText = isMin ? `W: ${worsts[index]}` : `B: ${bests[index]}`;
                ctx.fillStyle = '#475569';
                ctx.fillText(topText, xPos, top - 16);
                
                // 2. Draw Current consequence value above the bar
                const currVal = currentVals[index];
                const yPos = bar.y;
                ctx.fillStyle = '#ef4444';
                ctx.fillText(`${currVal}`, xPos, yPos - 6);
                
                // 3. Draw Absolute Zero at the bottom
                const bottomText = "0";
                ctx.fillStyle = '#94a3b8';
                ctx.fillText(bottomText, xPos, bottom + 14);
            });
            ctx.restore();
        }
    };

    swingChartInstance = new Chart(ctx, {
        type: 'bar',
        plugins: [swingLabelPlugin],
        data: {
            labels: currentResultsData.nomesCrit,
            datasets: [{
                data: percentages,
                backgroundColor: 'rgba(239, 68, 68, 0.25)',
                borderColor: '#ef4444',
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
                barThickness: 24
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 25,
                    bottom: 15
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        color: '#64748b',
                        font: { family: "'Inter', sans-serif", size: 10 },
                        callback: function(value) { return value + '%'; }
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.12)' }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#475569',
                        font: { family: "'Inter', sans-serif", weight: 600, size: 12 }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const idx = context.dataIndex;
                            const pct = percentages[idx];
                            return [
                                `Valor Correspondente: ${currentValues[idx]}`,
                                `Melhor (B): ${bestValues[idx]}`,
                                `Pior (W): ${worstValues[idx]}`,
                                `Máximo Consequência: ${maxValues[idx]}`,
                                `Percentual na Escala: ${pct.toFixed(1)}%`
                            ];
                        }
                    }
                },
                swingLabels: {
                    bests: bestValues,
                    worsts: worstValues,
                    maxs: maxValues,
                    currentVals: currentValues,
                    isMins: isMinArray
                }
            }
        }
    });
}

// ── SENSITIVITY ANALYSIS LOGIC ────────────────────────────────────────────────

function initSensitivityAnalysisFeatures() {
    const btnRunSensitivityFinal = document.getElementById('btnRunSensitivityFinal');
    if (!btnRunSensitivityFinal) return;
    
    // Clean listener and bind
    const btnRunSens = replaceWithClone('btnRunSensitivityFinal');
    btnRunSens.addEventListener('click', () => {
        setupASInputScreen();
        // Hide other tab buttons
        document.getElementById('tabFinalResultsBtn').style.display = 'none';
        
        // Open the AS tab
        openTab(null, 'tabSensitivity');
    });

    const btnBack = document.getElementById('btnBackFromAS');
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            // Restore final results tab visibility
            document.getElementById('tabFinalResultsBtn').style.display = 'block';
            openTab(null, 'tabFinalResults');
        });
    }

    const btnApplyGlobal = document.getElementById('btnApplyGlobalVariation');
    if (btnApplyGlobal) {
        btnApplyGlobal.addEventListener('click', () => {
            const val = parseFloat(document.getElementById('inputGlobalVariation').value) || 0;
            document.querySelectorAll('.as-crit-variation').forEach(input => {
                input.value = val;
            });
        });
    }

    const btnRunAS = document.getElementById('btnRunAS');
    if (btnRunAS) {
        btnRunAS.addEventListener('click', async () => {
            await executeAS();
        });
    }
}

function getCriterionRange(idx) {
    const data = currentResultsData;
    const type = data.tipoCrit[idx];
    const levels = data.niveisCrit ? data.niveisCrit[idx] : 0;
    
    let minVal = 0;
    let maxVal = 1;
    
    if (type !== 2 && type !== 3) {
        const values = data.matrizConseq.map(row => row[idx]);
        minVal = Math.min(...values);
        maxVal = Math.max(...values);
    } else {
        if (levels === 2) {
            minVal = 0.0;
            maxVal = 1.0;
        } else if (levels > 2) {
            minVal = 1.0;
            maxVal = parseFloat(levels);
        }
    }
    return { minVal, maxVal };
}

function setupASInputScreen() {
    const data = currentResultsData;
    if (!data) return;
    
    const listContainer = document.getElementById('asCriteriaList');
    if (!listContainer) return;
    
    // Store current variation values to preserve them across language toggles
    const currentVals = {};
    document.querySelectorAll('.as-crit-variation').forEach(input => {
        const idx = input.getAttribute('data-crit-index');
        currentVals[idx] = input.value;
    });
    
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    
    const typeLabels = [
        dict.crit_type_continuous || "Continuous",
        dict.crit_type_continuous || "Continuous",
        dict.crit_type_discrete || "Discrete",
        dict.crit_type_discrete || "Discrete",
        dict.crit_type_integer || "Integer",
        dict.crit_type_integer || "Integer"
    ];
    
    const rangeLabel = lang === 'pt' ? 'Intervalo' : 'Range';
    
    let html = '';
    for (let i = 0; i < data.nomesCrit.length; i++) {
        const critName = data.nomesCrit[i];
        const type = data.tipoCrit[i];
        const typeLabel = typeLabels[type] || 'N/A';
        const { minVal, maxVal } = getCriterionRange(i);
        const val = currentVals[i] !== undefined ? currentVals[i] : "10";
        
        html += `
            <div class="filter-control-group" style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 12px; align-items: center; border-bottom: 1px dashed var(--border-light); padding-bottom: 8px;">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 13px; font-weight: 600; color: var(--text-color);">${critName}</span>
                    <span style="font-size: 11px; color: var(--text-muted);">${typeLabel}</span>
                </div>
                <div style="font-size: 12px; color: var(--text-muted); text-align: center;">
                    ${rangeLabel}: [${minVal}, ${maxVal}]
                </div>
                <div style="display: flex; gap: 4px; align-items: center; justify-content: flex-end;">
                    <input type="number" class="input-delphi as-crit-variation" data-crit-index="${i}" style="width: 70px; padding: 4px 8px; text-align: center;" value="${val}" min="0" max="100">%
                </div>
            </div>
        `;
    }
    listContainer.innerHTML = html;
    
    // Only hide results panel and show placeholder if we don't have a last AS result
    if (!lastASResult) {
        document.getElementById('asResultsCard').style.display = 'none';
        document.getElementById('asResultsPlaceholder').style.display = 'flex';
    }
}

function getOriginalAlternativeProbabilities() {
    const data = currentResultsData;
    const rationality = data.rationality || 'compensatory';
    const model = rationality === 'compensatory' ? 'roc' : 'promethee';
    const methodData = data[model];
    
    const numAlt = data.nomesAlt.length;
    const originalProbs = Array(numAlt).fill(0);
    const sumFreqs = methodData.resultSol.reduce((a, b) => a + b, 0);
    
    if (sumFreqs === 0) return originalProbs;
    
    for (let k = 0; k < methodData.matrizSol.length; k++) {
        const solProfile = methodData.matrizSol[k];
        const freq = methodData.resultSol[k];
        for (let j = 0; j < numAlt; j++) {
            if (solProfile[j] === 1) {
                originalProbs[j] += freq;
            }
        }
    }
    
    for (let j = 0; j < numAlt; j++) {
        originalProbs[j] = originalProbs[j] / sumFreqs;
    }
    return originalProbs;
}

async function executeAS() {
    const data = currentResultsData;
    if (!data) return;
    
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        // Change text to say Running simulation
        const textEl = document.getElementById('loadingText');
        const lang = localStorage.getItem('spear_lang') || 'en';
        if (textEl) {
            textEl.textContent = lang === 'pt' ? 'Executando simulação de Monte Carlo...' : 'Running Monte Carlo simulation...';
        }
        overlay.style.display = 'flex';
    }
    
    // Get variations
    const variationInputs = document.querySelectorAll('.as-crit-variation');
    const variationsPct = Array(data.nomesCrit.length).fill(0.10);
    variationInputs.forEach(input => {
        const idx = parseInt(input.dataset.critIndex);
        const val = parseFloat(input.value) || 0;
        variationsPct[idx] = val / 100.0;
    });
    
    const payload = {
        problemName: data.problemName,
        rationality: data.rationality || 'compensatory',
        numCrit: data.nomesCrit.length,
        numAlt: data.nomesAlt.length,
        tipoCrit: data.tipoCrit,
        niveisCrit: data.niveisCrit || Array(data.nomesCrit.length).fill(0),
        nomeCrit: data.nomesCrit,
        nomeAlt: data.nomesAlt,
        matrizConseq: data.matrizConseq,
        rankFilters: activeFilters,
        holisticEvaluations: activeHolisticFilters.map(hf => ({
            alt1: data.nomesAlt[hf.alt1Idx],
            relation: hf.relation,
            alt2: hf.alt2Idx === 'fictitious' ? 'fictitious' : data.nomesAlt[hf.alt2Idx],
            fictitiousValue: hf.alt2Idx === 'fictitious' ? hf.fictitiousValue : null
        })),
        decompositionPreferences: typeof activeDecompositionPreferences !== 'undefined' ? activeDecompositionPreferences : [],
        variationsPct: variationsPct
    };
    
    try {
        const res = await fetch('/api/sensitivity', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        
        if (result.success) {
            lastASResult = result;
            // Render results
            renderASResults(result);
        } else {
            alert('Error running Sensitivity Analysis: ' + result.error);
        }
    } catch (err) {
        console.error(err);
        alert('Network error while running Sensitivity Analysis.');
    } finally {
        if (overlay) {
            overlay.style.display = 'none';
            // Restore default text
            const textEl = document.getElementById('loadingText');
            if (textEl) {
                const lang = localStorage.getItem('spear_lang') || 'en';
                const dict = translations[lang] || translations.en;
                textEl.textContent = dict.recalculating || 'Recalculating partial results...';
            }
        }
    }
}

function renderASResults(result) {
    const data = currentResultsData;
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    
    // Hide placeholder, show results panel
    document.getElementById('asResultsPlaceholder').style.display = 'none';
    const resultsCard = document.getElementById('asResultsCard');
    resultsCard.style.display = 'flex';
    
    // Compute original probabilities
    const originalProbs = getOriginalAlternativeProbabilities();
    
    // Filter: only show alternatives that were solution at least once in the AS (prob > 0)
    const alts = result.alternatives;
    const probs = result.probabilities;
    const activeIndices = alts.map((_, j) => j).filter(j => probs[j] > 0);
    const filteredAlts = activeIndices.map(j => alts[j]);
    const filteredProbs = activeIndices.map(j => probs[j]);
    const filteredOrigProbs = activeIndices.map(j => originalProbs[j]);
    
    // Render Table
    const tbody = document.querySelector('#asResultsTable tbody');
    tbody.innerHTML = '';
    
    for (let i = 0; i < filteredAlts.length; i++) {
        const origPct = (filteredOrigProbs[i] * 100).toFixed(2) + '%';
        const asPct = (filteredProbs[i] * 100).toFixed(2) + '%';
        
        tbody.innerHTML += `
            <tr>
                <td style="font-weight: 600; text-align: left;">${filteredAlts[i]}</td>
                <td style="color: var(--text-muted); text-align: center;">${origPct}</td>
                <td style="font-weight: 700; color: var(--delphi-light-blue); text-align: center;">${asPct}</td>
            </tr>
        `;
    }
    
    // Render Chart
    if (asChartInstance) {
        asChartInstance.destroy();
        asChartInstance = null;
    }
    
    const ctx = document.getElementById('asChart').getContext('2d');
    
    // Create datasets: Original Freq vs AS Probability (filtered to alts with prob > 0)
    const originalData = filteredOrigProbs.map(p => +(p * 100).toFixed(2));
    const asData = filteredProbs.map(p => +(p * 100).toFixed(2));
    
    asChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: filteredAlts,
            datasets: [
                {
                    label: lang === 'pt' ? 'Freq. Original (%)' : 'Original Freq (%)',
                    data: originalData,
                    backgroundColor: 'rgba(148, 163, 184, 0.4)',
                    borderColor: 'rgba(148, 163, 184, 1)',
                    borderWidth: 1.5,
                    borderRadius: 4
                },
                {
                    label: lang === 'pt' ? 'Probabilidade AS (%)' : 'AS Probability (%)',
                    data: asData,
                    backgroundColor: 'rgba(59, 130, 246, 0.85)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1.5,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        color: '#64748b',
                        font: { family: "'Inter', sans-serif", size: 11 },
                        callback: function(val) { return val + '%'; }
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.12)' }
                },
                x: {
                    ticks: {
                        color: '#475569',
                        font: { family: "'Inter', sans-serif", weight: 600, size: 12 }
                    },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { family: "'Inter', sans-serif", size: 11 },
                        color: '#475569'
                    }
                }
            }
        }
    });
}

// ── DECOMPOSITION ELICITATION CONTROLLER ──

function initDecompositionElicitation(data) {
    console.log("initDecompositionElicitation called with data:", data);
    if (!data) return;
    renderDecompositionQuestion(data.decompositionQuestion);
    renderDecompositionPreferences();
}

function renderDecompositionQuestion(question) {
    console.log("renderDecompositionQuestion called with question:", question);
    const area = document.getElementById('decompositionQuestionArea');
    if (!area) return;
    
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    
    if (!question) {
        area.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin: 20px 0; font-style:italic;">${dict.no_more_questions || 'Não há mais perguntas de decomposição disponíveis.'}</p>`;
        clearDecompositionChart();
        return;
    }
    
    const critA = question.critA;
    const critB = question.critB;
    const ratio = question.ratio;
    
    const valB_best = denormalizeCriterionValue(question.critBIdx, 1.0);
    const valA_worst = denormalizeCriterionValue(question.critAIdx, 0.0);
    const valB_worst = denormalizeCriterionValue(question.critBIdx, 0.0);
    const valA_ratio = denormalizeCriterionValue(question.critAIdx, ratio);
    
    const opt1Label = lang === 'pt' ? 'Opção 01' : 'Option 01';
    const opt2Label = lang === 'pt' ? 'Opção 02' : 'Option 02';
    const opt1Desc = lang === 'pt' 
        ? `Melhor desempenho no critério ${critB} e pior no critério ${critA}`
        : `Best performance on criterion ${critB} and worst on criterion ${critA}`;
    const opt2Desc = lang === 'pt'
        ? `Desempenho pior no critério ${critB} e desempenho ${ratio.toFixed(2)} no critério ${critA}`
        : `Worst performance on criterion ${critB} and performance ${ratio.toFixed(2)} on criterion ${critA}`;
        
    area.innerHTML = `
        <div class="decomposition-container" style="display:flex; flex-direction:column; gap:16px;">
            <div style="display:flex; gap:16px; align-items:center; justify-content:center; flex-wrap:wrap;">
                <!-- Option 1 Card -->
                <div class="decomposition-opt-card" id="btnDecompOpt1" 
                    style="flex:1; min-width:200px; padding:16px; border:2px solid var(--border-light); border-radius:12px; background:var(--bg-card); cursor:pointer; transition:all 0.2s ease-in-out; text-align:center;"
                    onmouseenter="this.style.borderColor='var(--delphi-blue)'; this.style.transform='translateY(-2px)';" 
                    onmouseleave="this.style.borderColor='var(--border-light)'; this.style.transform='none';">
                    <div style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--delphi-blue); margin-bottom:8px;">${opt1Label}</div>
                    <div style="font-size:15px; font-weight:600; color:var(--text-color); margin-bottom:12px;">
                        ${critB}: <span style="color:#16a34a; font-weight:700;">${valB_best.toFixed(2)}</span><br>
                        ${critA}: <span style="color:#dc2626; font-weight:700;">${valA_worst.toFixed(2)}</span>
                    </div>
                    <p style="font-size:11px; color:var(--text-muted); margin:0;">${opt1Desc}</p>
                </div>
                
                <div style="font-weight:700; color:var(--text-muted); font-size:16px;">VS</div>
                
                <!-- Option 2 Card -->
                <div class="decomposition-opt-card" id="btnDecompOpt2" 
                    style="flex:1; min-width:200px; padding:16px; border:2px solid var(--border-light); border-radius:12px; background:var(--bg-card); cursor:pointer; transition:all 0.2s ease-in-out; text-align:center;"
                    onmouseenter="this.style.borderColor='var(--delphi-orange,#f59e0b)'; this.style.transform='translateY(-2px)';" 
                    onmouseleave="this.style.borderColor='var(--border-light)'; this.style.transform='none';">
                    <div style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--delphi-orange,#f59e0b); margin-bottom:8px;">${opt2Label}</div>
                    <div style="font-size:15px; font-weight:600; color:var(--text-color); margin-bottom:12px;">
                        ${critB}: <span style="color:#dc2626; font-weight:700;">${valB_worst.toFixed(2)}</span><br>
                        ${critA}: <span style="color:var(--delphi-blue); font-weight:700;">${valA_ratio.toFixed(2)}</span>
                    </div>
                    <p style="font-size:11px; color:var(--text-muted); margin:0;">${opt2Desc}</p>
                </div>
            </div>
            
            <div style="display:flex; justify-content:flex-end;">
                <button class="btn btn-secondary" id="btnDecompSkip" 
                    style="padding:8px 16px; font-size:13px; font-weight:600; border-radius:8px; border:1px solid var(--border-color); background:transparent; color:var(--text-color); cursor:pointer; transition:all 0.2s;">
                    <span style="margin-right:4px;">🔄</span> ${dict.change_question || 'Mudar Pergunta'}
                </button>
            </div>
        </div>
    `;
    
    // Bind event listeners
    document.getElementById('btnDecompOpt1').addEventListener('click', () => {
        activeDecompositionPreferences.push({
            critA: question.critA,
            critB: question.critB,
            relation: '>=',
            ratio: question.ratio
        });
        excludedDecompositionPairs = []; // Clear skips on new choice
        recalculateActiveResults();
    });
    
    document.getElementById('btnDecompOpt2').addEventListener('click', () => {
        activeDecompositionPreferences.push({
            critA: question.critA,
            critB: question.critB,
            relation: '<=',
            ratio: question.ratio
        });
        excludedDecompositionPairs = []; // Clear skips on new choice
        recalculateActiveResults();
    });
    
    document.getElementById('btnDecompSkip').addEventListener('click', () => {
        excludedDecompositionPairs.push([question.critAIdx, question.critBIdx]);
        recalculateActiveResults();
    });
    
    // Render consequence comparison chart
    renderDecompositionComparison(question.critAIdx, question.critBIdx, question.ratio);
}

function renderDecompositionPreferences() {
    const list = document.getElementById('decompositionActiveList');
    if (!list) return;
    
    if (activeDecompositionPreferences.length === 0) {
        list.innerHTML = `<p style="font-size:12px; color:var(--text-muted); text-align:center; margin:10px 0; font-style:italic;">None</p>`;
        return;
    }
    
    let html = '';
    activeDecompositionPreferences.forEach((dp, idx) => {
        const relationSymbol = dp.relation === '>=' ? '≥' : '≤';
        const text = `${dp.critB} ${relationSymbol} ${dp.ratio.toFixed(2)} * ${dp.critA}`;
        
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-main); border:1px solid var(--border-light); border-radius:6px; padding:6px 12px; font-size:12px;">
                <span style="font-weight:600; color:var(--text-color);">${text}</span>
                <button class="btn" onclick="deleteDecompositionPreference(${idx})" type="button" 
                    style="padding:2px 6px; background:transparent; border:none; color:#ef4444; font-weight:700; cursor:pointer; font-size:14px;" title="Delete preference">✕</button>
            </div>
        `;
    });
    list.innerHTML = html;
}

window.deleteDecompositionPreference = function(index) {
    activeDecompositionPreferences.splice(index, 1);
    excludedDecompositionPairs = []; // Clear skips to allow recalculation of skipped pairs
    recalculateActiveResults();
};

window.setDecompositionView = function(viewType, event) {
    activeDecompositionView = viewType;
    const card = document.getElementById('decompositionComparisonCard');
    if (card) {
        const links = card.querySelectorAll('.subtab-link');
        links.forEach(l => l.classList.remove('active'));
    }
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    if (currentResultsData && currentResultsData.decompositionQuestion) {
        const q = currentResultsData.decompositionQuestion;
        renderDecompositionComparison(q.critAIdx, q.critBIdx, q.ratio);
    }
};

function clearDecompositionChart() {
    if (decompositionChartInstance) {
        decompositionChartInstance.destroy();
        decompositionChartInstance = null;
    }
    const chartCanvas = document.getElementById('decompositionConsequenceChart');
    const tableContainer = document.getElementById('decompositionConsequenceTableContainer');
    if (chartCanvas) chartCanvas.parentNode.style.display = 'none';
    if (tableContainer) {
        tableContainer.style.display = 'block';
        tableContainer.innerHTML = `<p style="text-align:center; padding: 20px; color: var(--text-muted); font-style: italic;">No active question to visualize.</p>`;
    }
}

function renderDecompositionComparison(critAIdx, critBIdx, Y) {
    const data = currentResultsData;
    if (!data) return;
    
    const lang = localStorage.getItem('spear_lang') || 'en';
    const dict = translations[lang] || translations.en;
    
    const numCrit = data.nomesCrit.length;
    const nomesCrit = data.nomesCrit;
    const tipoCrit = data.tipoCrit;
    
    const normVals1 = Array(numCrit).fill(0.0);
    normVals1[critBIdx] = 1.0;
    
    const normVals2 = Array(numCrit).fill(0.0);
    normVals2[critAIdx] = Y;
    
    const originalVals1 = [];
    const originalVals2 = [];
    for (let i = 0; i < numCrit; i++) {
        originalVals1.push(denormalizeCriterionValue(i, normVals1[i]));
        originalVals2.push(denormalizeCriterionValue(i, normVals2[i]));
    }
    
    // Cleanup previous chart
    if (decompositionChartInstance) {
        decompositionChartInstance.destroy();
        decompositionChartInstance = null;
    }
    
    const chartCanvas = document.getElementById('decompositionConsequenceChart');
    const tableContainer = document.getElementById('decompositionConsequenceTableContainer');
    
    const alt1Name = dict.option_1 || 'Option 01';
    const alt2Name = dict.option_2 || 'Option 02';
    
    if (activeDecompositionView === 'table') {
        chartCanvas.parentNode.style.display = 'none';
        tableContainer.style.display = 'block';
        
        let html = `<table class="consequence-comp-table">
            <thead>
                <tr>
                    <th style="text-align:left;">${dict.crit_col || 'Criterion'}</th>
                    <th>${dict.type_col || 'Type'}</th>
                    <th>${alt1Name}</th>
                    <th>${alt2Name}</th>
                    <th>${dict.diff_col || 'Diff'}</th>
                    <th>${dict.better_col || 'Better'}</th>
                </tr>
            </thead>
            <tbody>`;
            
        const typeLabels = {
            0: dict.crit_type_cont_min,
            1: dict.crit_type_cont_max,
            2: dict.crit_type_disc_min,
            3: dict.crit_type_disc_max,
            4: dict.crit_type_int_min,
            5: dict.crit_type_int_max
        };
        
        for (let i = 0; i < numCrit; i++) {
            const val1 = originalVals1[i];
            const val2 = originalVals2[i];
            const diff = val1 - val2;
            const tipo = tipoCrit[i];
            const isMin = (tipo === 0 || tipo === 2 || tipo === 4);
            
            let diffText = diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
            if (diff === 0) diffText = "0.00";
            
            let betterAlt = '';
            if (Math.abs(diff) < 1e-9) {
                betterAlt = `<span class="comp-equal">${dict.tie || 'Tie'}</span>`;
            } else if (isMin) {
                betterAlt = diff < 0 ? `<span class="comp-better">${alt1Name}</span>` : `<span class="comp-better">${alt2Name}</span>`;
            } else {
                betterAlt = diff > 0 ? `<span class="comp-better">${alt1Name}</span>` : `<span class="comp-better">${alt2Name}</span>`;
            }
            
            html += `<tr>
                <td class="text-left">${nomesCrit[i]}</td>
                <td>${typeLabels[tipo] || 'Cont. Min.'}</td>
                <td style="font-weight:600;">${val1.toFixed(2)}</td>
                <td style="font-weight:600;">${val2.toFixed(2)}</td>
                <td style="color:${diff === 0 ? 'var(--text-muted)' : (diff > 0 ? '#15803d' : '#b91c1c')}; font-weight:600;">${diffText}</td>
                <td>${betterAlt}</td>
            </tr>`;
        }
        
        html += `</tbody></table>`;
        tableContainer.innerHTML = html;
    } else {
        chartCanvas.parentNode.style.display = 'block';
        tableContainer.style.display = 'none';
        
        const ctx = chartCanvas.getContext('2d');
        
        if (activeDecompositionView === 'bar') {
            decompositionChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: nomesCrit,
                    datasets: [
                        {
                            label: alt1Name,
                            data: normVals1,
                            backgroundColor: 'rgba(37, 99, 235, 0.85)',
                            borderColor: 'rgba(37, 99, 235, 1)',
                            borderWidth: 1
                        },
                        {
                            label: alt2Name,
                            data: normVals2,
                            backgroundColor: 'rgba(245, 158, 11, 0.85)',
                            borderColor: 'rgba(245, 158, 11, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 1.05,
                            title: { display: true, text: dict.normalized_perf || 'Normalized Performance [0, 1]', font: { family: "'Inter', sans-serif", weight: 'bold' } },
                            grid: { color: 'rgba(226, 232, 240, 0.6)' },
                            ticks: { font: { family: "'Inter', sans-serif" } }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { family: "'Inter', sans-serif" } }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const isDataset0 = (context.datasetIndex === 0);
                                    const origVal = isDataset0 ? originalVals1[context.dataIndex] : originalVals2[context.dataIndex];
                                    const normVal = isDataset0 ? normVals1[context.dataIndex] : normVals2[context.dataIndex];
                                    return `${context.dataset.label}: ${origVal.toFixed(2)} (Norm: ${normVal.toFixed(2)})`;
                                }
                            }
                        }
                    }
                }
            });
        } else if (activeDecompositionView === 'line') {
            decompositionChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: nomesCrit,
                    datasets: [
                        {
                            label: alt1Name,
                            data: normVals1,
                            borderColor: 'rgba(37, 99, 235, 1)',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            borderWidth: 2.5,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            tension: 0.15
                        },
                        {
                            label: alt2Name,
                            data: normVals2,
                            borderColor: 'rgba(245, 158, 11, 1)',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderWidth: 2.5,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            tension: 0.15
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 1.05,
                            title: { display: true, text: dict.normalized_perf || 'Normalized Performance [0, 1]', font: { family: "'Inter', sans-serif", weight: 'bold' } },
                            grid: { color: 'rgba(226, 232, 240, 0.6)' },
                            ticks: { font: { family: "'Inter', sans-serif" } }
                        },
                        x: {
                            grid: { display: true, color: 'rgba(226, 232, 240, 0.3)' },
                            ticks: { font: { family: "'Inter', sans-serif" } }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const isDataset0 = (context.datasetIndex === 0);
                                    const origVal = isDataset0 ? originalVals1[context.dataIndex] : originalVals2[context.dataIndex];
                                    const normVal = isDataset0 ? normVals1[context.dataIndex] : normVals2[context.dataIndex];
                                    return `${context.dataset.label}: ${origVal.toFixed(2)} (Norm: ${normVal.toFixed(2)})`;
                                }
                            }
                        }
                    }
                }
            });
        } else if (activeDecompositionView === 'radar') {
            decompositionChartInstance = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: nomesCrit,
                    datasets: [
                        {
                            label: alt1Name,
                            data: normVals1,
                            backgroundColor: 'rgba(37, 99, 235, 0.25)',
                            borderColor: 'rgba(37, 99, 235, 1)',
                            pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                            borderWidth: 2
                        },
                        {
                            label: alt2Name,
                            data: normVals2,
                            backgroundColor: 'rgba(245, 158, 11, 0.25)',
                            borderColor: 'rgba(245, 158, 11, 1)',
                            pointBackgroundColor: 'rgba(245, 158, 11, 1)',
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: { display: true, color: 'rgba(226, 232, 240, 0.8)' },
                            grid: { color: 'rgba(226, 232, 240, 0.8)' },
                            suggestedMin: 0,
                            suggestedMax: 1,
                            ticks: {
                                backdropColor: 'transparent',
                                font: { size: 9 }
                            },
                            pointLabels: {
                                font: { family: "'Inter', sans-serif", weight: 'bold', size: 11 }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const isDataset0 = (context.datasetIndex === 0);
                                    const origVal = isDataset0 ? originalVals1[context.dataIndex] : originalVals2[context.dataIndex];
                                    const normVal = isDataset0 ? normVals1[context.dataIndex] : normVals2[context.dataIndex];
                                    return `${context.dataset.label}: ${origVal.toFixed(2)} (Norm: ${normVal.toFixed(2)})`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }
}



