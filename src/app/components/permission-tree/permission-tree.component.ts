// permission-tree.component.ts
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'permission-tree',
  imports: [CommonModule, TreeModule],
  templateUrl: './permission-tree.component.html',
  styleUrl: './permission-tree.component.css'
})
export class PermissionTreeComponent implements OnInit, OnChanges {
  @Input() permissions: any[] = [];
  @Input() selectedPermissionIds: number[] = [];

  @Output() permissionsChange = new EventEmitter<number[]>();

  permissionTree: TreeNode[] = [];
  selectedPermissions: TreeNode[] = [];

  ngOnInit(): void {
    if (this.permissions.length > 0) {
      this.buildPermissionTree();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['permissions'] && this.permissions.length > 0) {
      this.buildPermissionTree();
    }

    if (changes['selectedPermissionIds'] && this.selectedPermissionIds) {
      setTimeout(() => {
        this.updateTreeSelection();
      }, 100);
    }
  }

  buildPermissionTree(): void {
    this.permissionTree = this.buildPrimeNGTree(this.permissions);
    if (this.selectedPermissionIds && this.selectedPermissionIds.length > 0) {
      this.updateTreeSelection();
    }
  }

  buildPrimeNGTree(data: any[]): TreeNode[] {
    let tree: TreeNode[] = [];
    const nodeMap = new Map<string, TreeNode>();

    // Sắp xếp dữ liệu để đảm bảo node cha được xử lý trước
    const sortedData = [...data].sort((a, b) => a.name.split('.').length - b.name.split('.').length);
    sortedData.forEach(item => {
      const parts: string[] = item.name.split(".");
      const slug: string = item.slug ? item.slug.trim() : "";
      const id: number = item.id;
      let currentPath = "";

      // Tạo hoặc cập nhật node cho mỗi phần của path
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath = currentPath ? `${currentPath}.${part}` : part;

        // Kiểm tra xem item hiện tại có khớp với đường dẫn đầy đủ không
        const isExactMatch = currentPath === item.name;

        if (!nodeMap.has(currentPath)) {
          // Tạo node mới
          const newNode: TreeNode = {
            key: id.toString(), // Mỗi node đều có key riêng
            label: part,
            data: {
              id: isExactMatch ? id : null, // Chỉ gán id khi đúng node
              slug: isExactMatch ? slug : "",
              fullPath: currentPath
            },
            selectable: true, // Tất cả các node đều có thể chọn
            children: [],
            expanded: true
          };

          // Thêm vào tree hoặc node cha
          if (i === 0) {
            tree.push(newNode);
          } else {
            const parentPath = currentPath.substring(0, currentPath.lastIndexOf('.'));
            const parentNode = nodeMap.get(parentPath);
            if (parentNode && parentNode.children) {
              parentNode.children.push(newNode);
            }
          }

          nodeMap.set(currentPath, newNode);
        } else if (isExactMatch) {
          // Cập nhật node đã tồn tại với dữ liệu từ item hiện tại
          const existingNode = nodeMap.get(currentPath);
          if (existingNode) {
            existingNode.key = id.toString();
            existingNode.data = {
              ...existingNode.data,
              id: id,
              slug: slug
            };
          }
        }
      }
    });

    // Cập nhật node dựa trên data thực tế
    data.forEach(item => {
      const node = nodeMap.get(item.name);
      if (node) {
        node.data = {
          id: item.id,
          slug: item.slug,
          fullPath: item.name
        };
      }
    });

    return tree;
  }

  // Xử lý khi chọn một node
  nodeSelect(event: any) {
    const node = event.node;
    const updatedPermissions = [...this.selectedPermissionIds];

    // Add the current node to permissions if it has an id
    if (node.data && node.data.id) {
      if (!updatedPermissions.includes(node.data.id)) {
        updatedPermissions.push(node.data.id);
      }
    }

    // If node is a parent - select all children
    if (node.children && node.children.length > 0) {
      this.selectAllChildren(node, updatedPermissions);
    }

    // Select all parent nodes and make them fully checked
    this.selectAllParents(node, updatedPermissions);

    // Force update the selection model to ensure UI representation is correct
    this.selectedPermissions = [...this.selectedPermissions];

    // Emit the updated permissions
    this.permissionsChange.emit(updatedPermissions);
  }

  // Hàm mới để chọn tất cả node cha
  selectAllParents(node: TreeNode, permissions: number[]): void {
    if (!node.data || !node.data.fullPath) return;

    const fullPath = node.data.fullPath;
    const pathParts = fullPath.split('.');

    // Skip if this is a root node
    if (pathParts.length <= 1) return;

    const findAndSelectParent = (nodes: TreeNode[], currentPathLevel: number): boolean => {
      for (const currentNode of nodes) {
        if (!currentNode.data || !currentNode.data.fullPath) continue;

        const expectedPath = pathParts.slice(0, currentPathLevel).join('.');

        if (currentNode.data.fullPath === expectedPath) {
          // This is a parent node, select it
          if (currentNode.data.id && !permissions.includes(currentNode.data.id)) {
            permissions.push(currentNode.data.id);
          }

          // Ensure the node is in selectedPermissions
          if (!this.selectedPermissions.some(p => p === currentNode)) {
            this.selectedPermissions.push(currentNode);
          }

          // Continue to find parent at higher level
          if (currentPathLevel > 1) {
            findAndSelectParent(this.permissionTree, currentPathLevel - 1);
          }

          return true;
        }

        // Search in children
        if (currentNode.children && currentNode.children.length > 0) {
          if (findAndSelectParent(currentNode.children, currentPathLevel)) {
            return true;
          }
        }
      }
      return false;
    };

    // Start finding from the highest level minus 1
    findAndSelectParent(this.permissionTree, pathParts.length - 1);
  }

  // Hàm đệ quy chọn tất cả node con
  selectAllChildren(node: TreeNode, permissions: number[]): void {
    if (node.children && node.children.length > 0) {
      node.children.forEach(childNode => {
        // Nếu node con là node lá có id
        if (childNode.data && childNode.data.id) {
          if (!permissions.includes(childNode.data.id)) {
            permissions.push(childNode.data.id);
          }
          // Thêm node vào selectedPermissions nếu chưa có
          if (!this.selectedPermissions.includes(childNode)) {
            this.selectedPermissions.push(childNode);
          }
        }
        // Nếu node con có các node con khác, tiếp tục đệ quy
        this.selectAllChildren(childNode, permissions);
      });
    }
  }

  // Xử lý khi bỏ chọn một node
  nodeUnselect(event: any) {
    const node = event.node;
    let updatedPermissions = [...this.selectedPermissionIds];

    // Chỉ xóa node hiện tại khỏi danh sách permissions
    if (node.data && node.data.id) {
      updatedPermissions = updatedPermissions.filter(id => id !== node.data.id);
    }

    // Bỏ chọn tất cả các node con nếu có
    if (node.children && node.children.length > 0) {
      updatedPermissions = this.unselectAllChildren(node, updatedPermissions);
    }

    // Đảm bảo tất cả node cha vẫn được giữ lại trong selectedPermissions
    setTimeout(() => {
      // Tìm và thêm lại các node cha vào selectedPermissions nếu chúng có trong permissions
      this.permissionTree.forEach(rootNode => {
        this.checkAndRestoreParentSelection(rootNode);
      });

      // Emit updated permissions
      this.permissionsChange.emit(updatedPermissions);
    }, 0);
  }

  // Hàm mới để kiểm tra và khôi phục trạng thái chọn của các node cha
  checkAndRestoreParentSelection(node: TreeNode): void {
    if (node.data && node.data.id && this.selectedPermissionIds.includes(node.data.id)) {
      // Nếu node này có trong permissions, đảm bảo nó được chọn
      if (!this.selectedPermissions.includes(node)) {
        this.selectedPermissions.push(node);
      }
    }

    // Kiểm tra các node con
    if (node.children && node.children.length > 0) {
      node.children.forEach(childNode => {
        this.checkAndRestoreParentSelection(childNode);
      });
    }
  }

  // Hàm đệ quy bỏ chọn tất cả node con
  unselectAllChildren(node: TreeNode, permissions: number[]): number[] {
    if (node.children && node.children.length > 0) {
      node.children.forEach(childNode => {
        // Nếu node con là node lá có id
        if (childNode.data && childNode.data.id) {
          permissions = permissions.filter(id => id !== childNode.data.id);
          // Xóa node khỏi selectedPermissions
          this.selectedPermissions = this.selectedPermissions.filter(p => p !== childNode);
        }
        // Nếu node con có các node con khác, tiếp tục đệ quy
        permissions = this.unselectAllChildren(childNode, permissions);
      });
    }
    return permissions;
  }

  // Cập nhật lựa chọn trên Tree dựa trên permissions đã chọn
  updateTreeSelection() {
    this.selectedPermissions = [];

    // Helper function to find nodes by ID
    const findNodesById = (nodes: TreeNode[], ids: number[]): TreeNode[] => {
      let result: TreeNode[] = [];

      for (const node of nodes) {
        if (node.data && node.data.id && ids.includes(node.data.id)) {
          result.push(node);
        }

        if (node.children && node.children.length > 0) {
          result = [...result, ...findNodesById(node.children, ids)];
        }
      }

      return result;
    };

    // First, find all nodes that match our permissions
    const selectedNodes = findNodesById(this.permissionTree, this.selectedPermissionIds);

    // For each node, make sure all its parents are selected too
    for (const node of selectedNodes) {
      this.selectedPermissions.push(node);

      if (node.data && node.data.fullPath && node.data.fullPath.includes('.')) {
        const updatedPermissions = [...this.selectedPermissionIds];
        this.selectAllParents(node, updatedPermissions);
        // We're not emitting here since this is just initializing from input
      }
    }

    // Force update the selection model
    this.selectedPermissions = [...this.selectedPermissions];
  }

  // Kiểm tra xem node hoặc tất cả các con của nó có được chọn không
  isNodeOrChildrenSelected(node: TreeNode): boolean {
    // Nếu node có id và được chọn
    if (node.data && node.data.id && this.selectedPermissionIds.includes(node.data.id)) {
      return true;
    }

    // Nếu có children, kiểm tra tất cả các con
    if (node.children && node.children.length > 0) {
      return node.children.every(child => this.isNodeOrChildrenSelected(child));
    }

    return false;
  }
}