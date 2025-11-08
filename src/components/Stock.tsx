import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Package, Plus, Pencil, Trash2, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';

export const Stock = () => {
  const { state, addStockMaterial, updateStockMaterial, deleteStockMaterial } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [nomeMaterial, setNomeMaterial] = useState('');
  const [qtdEmbalagem, setQtdEmbalagem] = useState('');
  const [unidadeEmbalagem, setUnidadeEmbalagem] = useState('g');
  const [precoPago, setPrecoPago] = useState('');

  const handleSubmit = () => {
    if (!nomeMaterial || !qtdEmbalagem || !precoPago) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const materialData = {
      nomeMaterial,
      qtdEmbalagem: parseFloat(qtdEmbalagem),
      unidadeEmbalagem,
      precoPago: parseFloat(precoPago),
    };

    if (editingId) {
      const custoUnitario = materialData.precoPago / materialData.qtdEmbalagem;
      updateStockMaterial(editingId, { ...materialData, custoUnitario });
      toast.success('Material atualizado com sucesso!');
    } else {
      addStockMaterial(materialData);
      toast.success('Material adicionado ao estoque!');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (id: string) => {
    const material = state.stockMaterials.find(m => m.id === id);
    if (material) {
      setEditingId(id);
      setNomeMaterial(material.nomeMaterial);
      setQtdEmbalagem(material.qtdEmbalagem.toString());
      setUnidadeEmbalagem(material.unidadeEmbalagem);
      setPrecoPago(material.precoPago.toString());
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este material?')) {
      deleteStockMaterial(id);
      toast.success('Material excluído do estoque');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNomeMaterial('');
    setQtdEmbalagem('');
    setUnidadeEmbalagem('g');
    setPrecoPago('');
  };

  const handleExport = () => {
    const masterPassword = localStorage.getItem('masterPassword');
    if (!masterPassword) {
      toast.error('Configure a Senha Mestra primeiro nas Configurações');
      return;
    }

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(state.stockMaterials),
      masterPassword
    ).toString();

    const blob = new Blob([encrypted], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estoque-${new Date().toISOString().split('T')[0]}.enc`;
    a.click();
    toast.success('Estoque exportado com sucesso!');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const masterPassword = localStorage.getItem('masterPassword');
    if (!masterPassword) {
      toast.error('Configure a Senha Mestra primeiro nas Configurações');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const encrypted = e.target?.result as string;
        const decrypted = CryptoJS.AES.decrypt(encrypted, masterPassword).toString(CryptoJS.enc.Utf8);
        const materials = JSON.parse(decrypted);
        
        // Importar materiais
        materials.forEach((material: any) => {
          addStockMaterial({
            nomeMaterial: material.nomeMaterial,
            qtdEmbalagem: material.qtdEmbalagem,
            unidadeEmbalagem: material.unidadeEmbalagem,
            precoPago: material.precoPago,
          });
        });
        
        toast.success('Estoque importado com sucesso!');
      } catch (error) {
        toast.error('Erro ao importar: senha incorreta ou arquivo corrompido');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          Estoque de Materiais
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Label htmlFor="import-stock" className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </span>
            </Button>
            <Input
              id="import-stock"
              type="file"
              accept=".enc"
              className="hidden"
              onChange={handleImport}
            />
          </Label>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Editar Material' : 'Novo Material'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome do Material *</Label>
                  <Input
                    value={nomeMaterial}
                    onChange={(e) => setNomeMaterial(e.target.value)}
                    placeholder="Ex: Linha Amigurumi Círculo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantidade da Embalagem *</Label>
                    <Input
                      type="number"
                      value={qtdEmbalagem}
                      onChange={(e) => setQtdEmbalagem(e.target.value)}
                      placeholder="Ex: 100"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label>Unidade *</Label>
                    <Input
                      value={unidadeEmbalagem}
                      onChange={(e) => setUnidadeEmbalagem(e.target.value)}
                      placeholder="Ex: g, ml, un"
                    />
                  </div>
                </div>
                <div>
                  <Label>Preço Pago (R$) *</Label>
                  <Input
                    type="number"
                    value={precoPago}
                    onChange={(e) => setPrecoPago(e.target.value)}
                    placeholder="Ex: 15.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                {qtdEmbalagem && precoPago && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium">Custo Unitário Calculado:</p>
                    <p className="text-2xl font-bold text-primary">
                      R$ {(parseFloat(precoPago) / parseFloat(qtdEmbalagem)).toFixed(4)} / {unidadeEmbalagem}
                    </p>
                  </div>
                )}
                <Button onClick={handleSubmit} className="w-full">
                  {editingId ? 'Atualizar' : 'Adicionar'} Material
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Materiais em Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          {state.stockMaterials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Nenhum material cadastrado ainda</p>
              <p className="text-sm mt-2">Adicione seu primeiro material para começar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Embalagem</TableHead>
                  <TableHead>Preço Pago</TableHead>
                  <TableHead>Custo Unitário</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.stockMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.nomeMaterial}</TableCell>
                    <TableCell>
                      {material.qtdEmbalagem} {material.unidadeEmbalagem}
                    </TableCell>
                    <TableCell>R$ {material.precoPago.toFixed(2)}</TableCell>
                    <TableCell className="font-bold text-primary">
                      R$ {material.custoUnitario.toFixed(4)} / {material.unidadeEmbalagem}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(material.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="bg-card rounded-lg border p-6">
        <p className="text-sm text-muted-foreground text-center">
          ⚠️ <strong>Módulo Sensível:</strong> Os dados do estoque são protegidos pela Senha Mestra.
        </p>
      </div>
    </div>
  );
};