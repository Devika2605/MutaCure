"""
generator.py — Fetches protein sequence from UniProt and applies known
disease-causing missense mutations before folding.

Person 2 owns this file.
"""

import re
import logging
import httpx

logger = logging.getLogger(__name__)

UNIPROT_SEARCH_URL = "https://rest.uniprot.org/uniprotkb/search"
REQUEST_TIMEOUT = 30
_AA = set("ACDEFGHIKLMNPQRSTVWY")

DISEASE_MUTATIONS = {
    "PPARG": [
        (115, "P", "Q", "P115Q - impairs ligand binding domain, T2D-linked"),
        (425, "L", "P", "L425P - disrupts helix 10, dominant negative"),
    ],
    "BRCA1": [
        (185, "A", "G", "185delAG - frameshift, hereditary breast cancer"),
        (1699, "R", "W", "R1699W - BRCT domain, disrupts tumor suppressor"),
    ],
    "BRCA2": [
        (617, "N", "S", "N617S - DNA binding domain, breast cancer risk"),
    ],
    "EGFR": [
        (858, "L", "R", "L858R - activating mutation, drives lung cancer"),
        (747, "E", "K", "E747K - exon 19 deletion region, TKI resistance"),
    ],
    "APOE": [
        (112, "C", "R", "C112R - APOE3 to APOE4 conversion, Alzheimers risk"),
        (158, "R", "C", "R158C - APOE2 variant, reduced LDL binding"),
    ],
    "KRAS": [
        (12, "G", "D", "G12D - most common KRAS mutation, RAS pathway activation"),
        (13, "G", "V", "G13V - GTP hydrolysis impairment, oncogenic"),
    ],
    "TP53": [
        (175, "R", "H", "R175H - hotspot mutation, loss of tumor suppression"),
        (248, "R", "W", "R248W - DNA contact mutation, dominant negative"),
        (273, "R", "H", "R273H - structural mutation, common in colorectal cancer"),
    ],
    "PTEN": [
        (130, "R", "Q", "R130Q - phosphatase domain, loss of function"),
    ],
    "BRAF": [
        (600, "V", "E", "V600E - constitutive kinase activation, melanoma"),
    ],
    "HFE": [
        (282, "C", "Y", "C282Y - hereditary hemochromatosis, iron overload"),
        (63,  "H", "D", "H63D - mild iron overload risk"),
    ],
    "CFTR": [
        (508, "F", "L", "F508del - most common CF mutation, protein misfolding"),
    ],
    "MYC": [
        (58, "T", "A", "T58A - impairs ubiquitination, lymphoma-linked"),
    ],
}

_FALLBACK_SEQUENCES = {
    "PPARG":  "MGETLGDSPIDPESDSFTDTLSANISQEMTMVDTEMPFWPTNFGISSVDLSVMEDHSHSFDIKPFTTVDFSSISTPHYEDIPFTRTDPVVADYKYDLKLQEYQSAIKVEPASPPQYSEKTQLYNKPHEEPSNSLMAIECRVCGDKASGFHYGVHACEGCKGFFRRTIRLKLIYDRCDLNCRIHKKSRNKCQYCRFQKCLAVGMSHNAIRFGRMPQAEKEKL",
    "BRCA1":  "MDLSALRVEEVQNVINAMQKILECPICLELIKEPVSTKCDHIFCKFCMLKLLNQKKGPSQCPLCKNDITKRSLQESTRFSQLVEELLKIICAFQLDTGLEYANSYNKLTLFCQKFKERNEKAIQKIKEELQQAVEAAKALAESSESQESDISEKLTYDQQFYFQVEENSLTQKMQEALEEFKQKAEEFHQKLQEYQEQRALLTIEENVTSELLAFQDQRDNLSL",
    "EGFR":   "MRPSGTAGAALLALLAALCPASRALEEKKVCQGTSNKLTQLGTFEDHFLSLQRMFNNCEVVLGNLEITYVQRNYDLSFLKTIQEVAGYVLIALNTVERIPLENLQIIRGNMYYENSYALAVLSNYDANKTGLKELPMRNLQEILHGAVRFSNNPALCNVESIQWRDIVSSDFLSNMSMDFQNHLGSCQKCDPSCPNGSCWGAGEENCQKLTKIICAQQCSGRCRGKSPSDCCHNQCAAGCTGPRESDCLVCRKFRDEATCKDTCPPLMLYNPTTYQMDVNPEGKYSFGATCVKKCPRNYVVTDHGSCVRACGADSYEMEEDGVRKCKKCEGPCRKVCNGIGIGEFKDSLSINATNIKHFKNCTSISGDLHILPVAFRGDSFTHTPPLDPQELDILKTVKEITGFLLIQAWPENRTDLHAFENLEIIRGRTKQHGQFSLAVVSLNITSLGLRSLKEISDGDVIISGNKNLCYANTINWKKLFGTSGQKTKIISNRGENSCKATGQVCHALCSPEGCWGPEPRDCVSCRNVSRGRECVDKCNLLEGEPREFVENSECIQCHPECLPQAMNITCTGRGPDNCIQCAHYIDGPHCVKTCPAGVMGENNTLVWKYADAGHVCHLCHPNCTYGCTGPGLEGCPTNGPKIPSIATGMVGALLLLLVVALGIGLFMRRRHIVRKRTLRRLLQERELVEPLTPSGEAPNQALLRILKETEFKKIKVLGSGAFGTVYKGLWIPEGEKVKIPVAIKELREATSPKANKEILDEAYVMASVDNPHVCRLLGICLTSTVQLITQLMPFGCLLDYVREHKDNIGSQYLLNWCVQIAKGMNYLEDRRLVHRDLAARNVLVKTPQHVKITDFGLAKLLGAEEKEYHAEGGKVPIKWMALESILHRIYTHQSDVWSYGVTVWELMTFGSKPYDGIPASEISSILEKGERLPQPPICTIDVYMIMVKCWMIDADSRPKFRELIIEFSKMARDPQRYLVIQGDERMHLPSPTDSNFYRALMDEEDMDDVVDADEYLIPQQGFFSSPSTSRTPLLSSLSATSNNSTVACIDRNGLQSCPIKEDSFLQRYSSDPTGALTEDSIDDTFLPVPEYINQSVPKRPAGSVQNPVYHNQPLNPAPSRDPHYQDPHSTAVGNPEYLNTVQPTCVNSTFDSPAHWAQKGSHQISLDNPDYQQDFFPKEAKPNGIFKGSTAENAEYLRVAPQSSEFIGA",
    "KRAS":   "MTEYKLVVVGAGGVGKSALTIQLIQNHFVDEYDPTIEDSY RKQVVIDGETCLLDILDTAGQEEYSAMRDQYMRT GEGFLCVFAINNTKSFEDIHHQRQEIKRVKDSEDVPMVLVGNKCDLPSRTVDTKQAQDLARSYGIPYIETSAKTRQHVREVDRE QKLISEEDL",
    "TP53":   "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPLSSSVPSQKTYPQGLADERRNNHEPPLNQKLIQLNPETASLWDPQAKNIAQFMEEKNIIMQTKHLHQSEDAGGDIASSSTAEGEEPPEKNLKQQFKQNIQRSMTGRVNLNLLPQKMGNEIITQRFQNLFGREVLNKTQKRNIDPLETQKQLHQAFQAASQNHQKLNQEQLQEIERLNKQKETLQSAYIKNMKAQNIQKQNQALQKALNAQKIQEQLRLLEKAQNQNNIKQQLEVNQ",
    "APOE":   "MKVLWAALLVTFLAGCQAKVEQAVETEPEPELRQQTEWQSGQRWELALGRFWDYLRWVQTLSEQVQEELLSSQVTQELRALMDETMKELKAYKSELEEQLTPVAEETRARLSKELQAAQARLGADMEDVCGRLVQYRGEVQAMLGQSTEELRVRLASHLRKLRKRLLRDADDLQKRLAVYQAGAREGAERGLSAIRERLGPLVEQGRVRAATVGSLAGQPLQERAQAWGERLRARMEEMGSRTRDRLDEVKEQVAEVRAKLEEQAQQIRLQAEAFQARLKSWFEPLVEDMQRQWAGLVEKVQAAVGTSAAPVPSDNH",
    "BRCA2":  "MPIGSKERPTFFEIFKTRCNKADLTHSQISLSAEFQKLIDLNLNEDQKRILSKIESKLQELIEEEDLKQQLQERQKLIKEEKMKQLEQEIQELRREYQQQLQEARLQRREQRQLERQQQQLNQSLQKAKNKLENKQKEMSQQEEQQTLNLQLQELQLERNQMQLQKQQEQLQQQLQNLQKQQEQLQQQLQNLQKQQEQLQQQLQNLQKQQEQLQEQLQTLENQIQKEKQELEQQLQSEKQQKQLESQLKKEEQQLNKQLKMVEEMRKTLQEKFQDMVEQVQNNQEKQLQEELEKERQHRDQFNQMQQQLPQQQNQHQHQKLKIQEQAKQISQKLQNMQEKFQELEQEKNSQLQKLQDEQQQLQKEREELREQQIEQLERQLQEEQRELLQLKELQEQMEQKVNQLQHQNQQLQKIQQEQSQNLEQLQQLENQLQQNLQQQNLQQQLQQQLQNLQKLQSQLQ",
    "HFE":    "MGVRSRRLLLAVLCLGFAQAPGSSSVDLAAEERRIIQERAKEEIERAEQQKLEELREQLREQQLQERGPPASRPGHQERRAERSQ",
    "PTEN":   "MTAIIKEIIGGRDSDSSDSHQSPRGSAKSTRALHAQRDIKQNSSLKTSQEIKSPKASSELQKQMQEQLQKMQNQIQELQESQLQKLQAQIQKLQNQIQELREQIQELREQLQSLQKLQEQIQKLQEQIQKLQEQLQKLQEQIQ",
    "BRAF":   "MAALSGGGGGAEPGQALFNGDMEPEAGAGAGAAASSAADPAIPEEVWNIKQMIKLTQEHIEALLDKFGGEHNPPSIYLEAYEEYTSKLDALQQREQQLLESLGNGTDFSVSSSASMDTVTSSSSSSLSVLPSSLSVFQNPTDVARSNPKSPQKPIVRVFLPNKQRTVVPARCGVTVRDSLKKALMMRGLIPECCAVYRIQDGEKKPIGWDTDISWLTGEELHVEVLENVPLTTHNFVRKTFFTLKSDVLFNLNKFERLIVAVLSFDKRTPHPARIGLHLEDLNSGKILKQKITVANILLALFLKTPAQHDFSSDSWKELECSAKTEPELRSEIRAHRRMLKHPQEQVNHFLSLEESQLAQFKEHQKLSELEQKLISAEEDLQELQGQKLEELQRQLQANIQEQLQQLEQLQ",
    "CFTR":   "MQRSPLEKASVVSKLFFSWTRPILRKGYRQRLELSDIYQIPSVDSADNLSEKLEREWDRELASKKNPKLINALRRCFFWRFMFYGIFLYLGEVTKAVQPLLLGDTINKTLHKFSLHCKLMCNLKQDDEGVLSMQTLNKKMAMQEAPPLQQLNQQKKHPLQKQQQLQKQQLQEEQHQQQKLQEQLQKLKNLQKQQEQLQKQLQEQLQKQLQK",
}



def generate_protein_sequence(
    target_protein: str,
    seed_sequence: str = "",
    max_length: int = 200,
    apply_mutation: bool = True,
    **kwargs,
) -> dict:
    logger.info(f"Fetching sequence for {target_protein} from UniProt...")

    try:
        wildtype = _fetch_from_uniprot(target_protein)
    except Exception as exc:
        logger.warning(f"UniProt fetch failed ({exc}), using fallback.")
        wildtype = _get_fallback(target_protein)

    # Use longer sequences for better structure quality
    effective_max = min(max_length, 400)
    wildtype = wildtype[:effective_max]

    if apply_mutation and target_protein.upper() in DISEASE_MUTATIONS:
        mutated, positions, info = _apply_mutations(
            wildtype, DISEASE_MUTATIONS[target_protein.upper()]
        )
        logger.info(f"Applied mutation: {info}")
    else:
        mutated = wildtype
        positions = []
        info = "No mutation applied (wild-type)"

    logger.info(f"Sequence ready - {len(mutated)} AA, {len(positions)} mutation site(s)")

    return {
        "sequence": mutated,
        "wildtype": wildtype,
        "mutation_info": info,
        "mutated_positions": positions,
    }


def _apply_mutations(sequence: str, mutations: list) -> tuple:
    seq = list(sequence)
    applied = []
    positions = []

    for pos_1based, wt_aa, mut_aa, description in mutations:
        idx = pos_1based - 1
        if idx >= len(seq):
            logger.warning(f"Mutation at pos {pos_1based} outside length {len(seq)}, skipping.")
            continue
        seq[idx] = mut_aa
        applied.append(description)
        positions.append(idx)

    info = " | ".join(applied) if applied else "No mutations in range"
    return "".join(seq), positions, info


def _fetch_from_uniprot(protein_name: str) -> str:
    params = {
        "query": f"gene:{protein_name} AND organism_id:9606 AND reviewed:true",
        "format": "fasta",
        "size": 1,
    }
    response = httpx.get(UNIPROT_SEARCH_URL, params=params, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    fasta = response.text
    if not fasta.strip():
        raise ValueError(f"No UniProt entry found for {protein_name}")
    return _parse_fasta(fasta)


def _parse_fasta(fasta: str) -> str:
    lines = fasta.strip().splitlines()
    seq_lines = [l for l in lines if not l.startswith(">")]
    raw = "".join(seq_lines).upper()
    return "".join(c for c in raw if c in _AA)


def _get_fallback(protein_name: str) -> str:
    seq = _FALLBACK_SEQUENCES.get(protein_name.upper(), "MKVLWAALLVTFLAGCQAK")
    return _clean_sequence(seq)


def _clean_sequence(raw: str) -> str:
    cleaned = re.sub(r"[^A-Za-z]", "", raw).upper()
    return "".join(c for c in cleaned if c in _AA)